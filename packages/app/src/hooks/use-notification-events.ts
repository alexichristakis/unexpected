import { useEffect } from "react";
import { Notifications } from "react-native-notifications";
import moment from "moment";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  NotificationPayload,
  PhotoNotificationPayload
} from "@unexpected/global";
import { CompositeNavigationProp } from "@react-navigation/core";

import * as selectors from "@redux/selectors";
import { AppActions, UserActions } from "@redux/modules";
import { NOTIFICATION_MINUTES } from "@lib/constants";

import { useReduxState } from "./use-redux-state";
import { useReduxAction } from "./use-redux-action";
import { TabParamList, StackParamList } from "../App";

export function useNotificationEvents(
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<StackParamList>
  >
) {
  const currentUserPhoneNumber = useReduxState(selectors.phoneNumber);
  const updateUser = useReduxAction(UserActions.updateUser);
  const setCameraTimer = useReduxAction(AppActions.setCameraTimer);

  const setPhotoTime = (payload: PhotoNotificationPayload) => {
    const { date } = payload;
    const expiry = moment(date).add(NOTIFICATION_MINUTES, "minutes");

    setCameraTimer(expiry);
  };

  return useEffect(() => {
    const subscribers = [
      Notifications.events().registerNotificationOpened(
        (notification, complete) => {
          // @ts-ignore
          const { payload }: { payload: NotificationPayload } = notification;

          switch (payload.type) {
            case "user": {
              const { phoneNumber } = payload.route;
              // nav to user
              navigation.navigate("PROFILE", {
                prevRoute: "Feed",
                phoneNumber
              });
              break;
            }

            case "post": {
              const { phoneNumber, id } = payload.route;

              if (phoneNumber === currentUserPhoneNumber) {
                // @ts-ignore
                navigation.navigate("USER_PROFILE_TAB", {
                  screen: "USER_PROFILE",
                  params: { focusedPostId: id }
                });
              } else {
                navigation.navigate("PROFILE", {
                  prevRoute: "Feed",
                  focusedPostId: id,
                  phoneNumber
                });
              }
              break;
            }

            case "photoTime": {
              setPhotoTime(payload);
              break;
            }
          }
          complete();
        }
      ),
      Notifications.events().registerNotificationReceivedForeground(
        (notification, complete) => {
          const { payload }: { payload: NotificationPayload } = notification;

          if (payload.type === "photoTime") {
            setPhotoTime(payload);
          }

          complete({ badge: false, alert: false, sound: false });
        }
      ),
      Notifications.events().registerNotificationReceivedBackground(
        (notification, complete) => {
          const { payload }: { payload: NotificationPayload } = notification;

          if (payload.type === "photoTime") {
            setPhotoTime(payload);
          }

          complete({ badge: true, alert: true, sound: true });
        }
      ),
      Notifications.events().registerRemoteNotificationsRegistered(
        ({ deviceToken }) => {
          updateUser({ deviceToken });
        }
      ),
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        event => {
          //   console.log(event.code, event.localizedDescription, event.domain);
        }
      )
    ];

    // request permissions
    // Notifications.registerRemoteNotifications();
  }, []);
}

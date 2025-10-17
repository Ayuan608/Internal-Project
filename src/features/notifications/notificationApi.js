import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1", // backend base URL
    credentials: "include",
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/notification/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    sendBulkNotification: builder.mutation({
      query: (data) => ({
        url: "/notification/send-bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    sendNotificationToAll: builder.mutation({
      query: (data) => ({
        url: "/notification/send-all",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useSendNotificationMutation,
  useSendBulkNotificationMutation,
  useSendNotificationToAllMutation,
} = notificationApi;

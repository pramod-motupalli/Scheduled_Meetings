# Huddle Project Workflow and Architecture Explanation

This document provides a detailed, step-by-step explanation of the Huddle project's workflow, broken down by folder, file, and function. 

Huddle is a multi-tenant SaaS application designed for scheduling and hosting online meetings. It features a React-based frontend and a microservice architecture for the backend (using Django, Django Channels for WebSockets, and LiveKit for WebRTC video/audio).

---

## 1. High-Level Architecture
The project is divided into two primary directories:
- **`app1/`**: Contains the frontend interface and a basic authentication backend.
  - **`frontend1/`**: The React + Vite single-page application where users interact with the system.
  - **`backend1/`**: An authentication-focused Django service (manages custom users, registration, and password reset).
- **`microservices/`**: The central Django backend handling the core business logic, meetings, WebSockets, and LiveKit integration.

---

## 2. Directory: `app1/frontend1/` (The React Application)
This directory contains the user interface. It is built using React and styled components/Tailwind.

### `src/` (Source Code)
* **`App.jsx`**: The root component. Defines routing (e.g., Dashboard, MeetingRoom, Auth pages).
  - `ProtectedRoute`: Ensures the user is logged in before accessing certain routes.
  - `isTokenExpired`: Utility to check if the JWT auth token is still valid.
* **`main.jsx`**: The entry point that mounts `App.jsx` to the DOM.

### `src/components/MeetingRoom/` (Live Meeting Interface)
This folder holds the components used when a user is actively inside a meeting.
* **`index.jsx` & `Meeting.jsx`**: The core components managing the state of an active meeting room.
  - `connectRoom` / `connect`: Establishes the connection to the LiveKit server using tokens fetched from the backend.
  - `toggleVideo`, `toggleMic`, `toggleHandRaise`: Functions that control the participant's media tracks.
  - `syncMediaState`: Keeps the local React state in sync with the LiveKit server state.
  - `updateParticipantState` / `fetchParticipantState`: Communicates with the backend WebSocket or API to update who is speaking/presenting.
* **`VideoStage.jsx`**: Manages the grid layout of video tiles.
  - `getParticipantRows` / `getRowSizes`: Calculates how to arrange video feeds based on the number of participants.
* **`Sidebar.jsx`**: Contains chat and participant lists during a meeting.
  - `loadChatHistory`: Fetches past chat messages from the backend.
  - `handleSendMessage`: Sends a new chat message via WebSockets.
* **`ScreenShareModule.jsx`**: Handles the display of a user sharing their screen.
* **`Header.jsx` & `Footer.jsx`**: UI components for meeting controls and metadata (like time and meeting ID).

### `src/components/schedule/` & `src/components/huddle/` (Scheduling & Dashboards)
* **`AdvanceSchedule.jsx`**: Form for creating a new meeting.
  - `handleScheduleMeeting`: Submits meeting details (time, attendees, recurrence) to the backend.
* **`ScheduledMeetings.jsx`**: Displays a list of upcoming meetings.
  - `fetchMeetings`: Retrieves the user's schedule from the API.
* **`HuddlePage.jsx`**: A dashboard for managing instant meetings (Huddles) and sessions.
  - `handleJoinSession` / `handleInstantMeeting`: Quickly drops the user into an active room.

### `src/pages/` (Top-Level Pages)
* **`LoginAuth.jsx` & `SignupAuth.jsx`**: Pages for user authentication.
  - `handleSubmit`: Posts credentials to the backend and saves the returned JWT to localStorage.
* **`MeetingLobby.jsx`**: The pre-join screen where users test their mic and camera.
  - `validateMeeting`: Checks with the backend if the meeting exists and is active before letting the user in.

---

## 3. Directory: `app1/backend1/` (Auth Service)
This Django project focuses purely on user identity.
* **`authentication/models.py`**:
  - `CustomUser`: The primary user model, extending Django's default.
* **`authentication/views.py`**:
  - `LoginView`, `RegisterView`, `LogoutView`: Handle standard authentication.
  - `PasswordResetRequestView`: Handles "forgot password" flows.
* **`authentication/serializers.py`**:
  - Converts user data to and from JSON (e.g., `UserSerializer`, `RegisterSerializer`).

---

## 4. Directory: `microservices/` (Core Business Logic Backend)
This is the heart of the system, handling meetings, scheduling, API keys, WebSockets, and WebRTC coordination.

### `backend/` (Project Configuration)
* **`authentication.py`**:
  - `ApiKeyAuthentication`: A custom DRF authentication class. Checks for multi-tenant API keys, ensuring keys are valid and limiting requests. Logs masked versions of the key for security.
* **`cache.py`**:
  - `FallbackRedisCache`: A robust caching mechanism that falls back gracefully if Redis is down. Overrides methods like `get`, `set`, and `delete`.
* **`permissions.py`**:
  - `IsCompanyUser`: Ensures users can only access data belonging to their tenant/company.

### `apps/meetings/` (The Main App)
This app manages the entire lifecycle of a meeting.

#### **`models.py`**
Defines the database schema:
* `User` & `ProductApiKey`: Multi-tenant structures.
* `Meeting`: Stores details about a scheduled or instant meeting (topic, start time, identifier).
* `MeetingParticipant`: Links a User to a Meeting.
* `RecurrenceRule`: Handles recurring meetings (e.g., every Monday).
* `Recording` & `Transcript`: Stores metadata for post-meeting assets.
* `ChatMessage`: Stores in-meeting text messages.

#### **`MeetingViews.py`** (REST API Endpoints)
* `ScheduleMeetingView`: Creates a new `Meeting` record in the database.
  - `generate_meeting_code`: Creates a unique string identifier (e.g., `abc-defg-hij`) for the meeting.
* `ValidateMeetingView`: Checks if a meeting code is valid when a user waits in the lobby.
* `LiveKitTokenView`: 
  - `post`: Generates a secure JWT token required by the frontend to join the LiveKit WebRTC server.
* `LiveKitWebhookView`: Receives event webhooks from the LiveKit server (e.g., when a recording finishes or a room is destroyed).
* `ChatMessageView`: API to fetch historical chat messages.

#### **`consumers.py`** (WebSocket Handlers)
Handles real-time, bi-directional communication using Django Channels.
* **`ParticipantConsumer`**:
  - `connect` / `disconnect`: Manages when a user joins or leaves the WebSocket room.
  - `hand_raise_broadcast` / `presence_broadcast`: Pushes real-time UI updates (like someone raising their hand or muting) to all other connected clients without relying on the LiveKit server.
* **`ChatConsumer`**:
  - `receive_json` / `chat_message`: Receives a chat message from one user, saves it to the database (`save_chat_message`), and broadcasts it to everyone else in the meeting.

#### **`livekit_utils.py`** (LiveKit SDK Wrapper)
Helper functions to interact with the external LiveKit server.
* `generate_join_token`: Uses the LiveKit SDK to create a token with specific permissions (e.g., can_publish, can_subscribe).
* `mute_participant_track`: Admin tool to forcefully mute someone via the server API.
* `kick_participant_from_room`: Removes a disruptive user from the WebRTC session.

#### **`redis_service.py` & `services.py`**
* `ParticipantRedisService`: 
  - `update_status` / `get_status`: Extremely fast lookups using Redis to check who is currently online in a meeting, bypassing slower database queries.
* `services.py`: Contains modular business logic like `join_meeting_session` (logs when a user enters) and `update_audio_state` (syncs their mic status).

---

## Summary of the Workflow (End-to-End User Journey)

1. **Authentication**: 
   The user visits the frontend and logs in via `app1/frontend1/src/pages/LoginAuth.jsx`. The request goes to `app1/backend1/authentication/views.py` (`LoginView`), which returns a JWT.
2. **Scheduling**: 
   The user creates a meeting via `AdvanceSchedule.jsx`. This hits `microservices/apps/meetings/MeetingViews.py` (`ScheduleMeetingView`), saving a `Meeting` to the database.
3. **Joining the Lobby**: 
   The user clicks a meeting link. They are taken to `MeetingLobby.jsx`. The frontend calls `ValidateMeetingView` to ensure the link is real.
4. **Entering the Room**:
   The user joins. The frontend requests a WebRTC token from `LiveKitTokenView`. The backend generates this using `livekit_utils.generate_join_token`.
5. **In the Meeting**:
   The frontend connects to LiveKit to send video/audio (`Meeting.jsx`). It also opens a WebSocket connection to `ParticipantConsumer` and `ChatConsumer` in `consumers.py` for real-time chat and hand-raising features. Redis (`ParticipantRedisService`) tracks their active status.
6. **Ending the Meeting**:
   When the user leaves, the WebSocket disconnects, updating their status in Redis and the DB. If they were the last person, `livekit_utils.delete_livekit_room` may be called to clean up server resources.

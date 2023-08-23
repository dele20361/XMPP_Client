# Chat using XMPP Protocol
Paola De León, 20361

## How to run
```
node main.js 2>/dev/null
```

Run saving server responses
```
node main.js  2> serverResponse.log
```

Install dependencies
```
node install xmpp/client
```

----

# Project Description: XMPP Instant Messagin Client
This project entails the development of an individual instant messaging client that supports the XMPP protocol. The primary goal is to create a console-based application that facilitates communication through XMPP. The project requires the implementation of specific functionalities, both related to account management and communication features

## Implemented Functionalities
Account Management:

**1. Register a New Account on the Server:** Users can create a new account by providing their desired username and password. This registration process is essential for accessing the messaging services.

**2. Log In with an Account:** Users can log in using their registered account credentials. This step is crucial to gain access to the XMPP server and initiate communication.

**3. Log Out from an Account:** Users can safely log out from their active accounts when they're done with their messaging sessions.

**4. Delete Account from the Server:** If users wish to discontinue using the messaging service, they can delete their account, which removes their presence from the XMPP server.

**5. Display All Contacts and Their Status:** The application will show a list of all contacts along with their availability status (online/offline).

**6. Add a User to Contacts:** Users can add other XMPP users to their contact list for easier communication.

**7. View Contact Details:** Users can view detailed information about a particular contact, including their username, status, and any other relevant details.

**8. One-on-One Communication:** Users can engage in one-on-one messaging with any of their contacts. They can send and receive text messages in real-time.

**9. Participate in Group Conversations:**
 The application allows users to join and participate in group conversations, enabling communication with multiple contacts simultaneously.

**10. Set Presence Status:** Users can define their presence status.

**10. Send/Receive Notifications: **
The application notifies users about new messages, friend requests, and other relevant events.

**11. Send/Receive Files:** Users can exchange files through the messaging client, enhancing the versatility of the communication platform.

## Proyect dificulties
- Connection with server: One of the significant challenges encountered during the project was establishing a stable connection with the server. This process took approximately four days to succeed.


- Language dificulties: As I embarked on this project, I confronted language difficulties, specifically related to my limited experience with JavaScript. While I had some exposure to JavaScript in the past, I hadn't extensively worked with it before. This presented a barrier when trying to implement certain features that required a strong command of the language. One notable struggle was dealing with asynchronous operations using promises. The intricacies of managing asynchronous code execution can be complex, and my unfamiliarity with it posed a significant learning curve.

- Time managment: Throughout the project, an overarching difficulty was time management. Each functionality and feature implementation seemed to consume a substantial amount of time. This observation underscores the importance of realistic project planning and setting achievable milestones. The project's complexities and learning curves likely contributed to the extended timeframes for each task. In retrospect, a more detailed project plan with time buffers for unforeseen challenges might have helped mitigate this issue.

## Learned Leasons
- One of the pivotal lessons learned from this experience is the value of seeking help. Consulting friends, colleagues, or online communities when faced with challenges can help to resolve problems faster. The project difficulty related to the server connection, for instance, could potentially have been resolved faster with input from peers who might have encountered similar issues. Overcoming the reluctance to ask for assistance is key to accelerating problem-solving.

- Start project since day 1: Another valuable lesson is the importance of starting a project as early as possible. Delaying the initiation of a project can lead to time constraints and rushed implementations, as unforeseen obstacles are a natural part of the development process. Starting early allows for a more measured pace, ample time for troubleshooting, and the flexibility to adjust the project plan based on emerging challenges.
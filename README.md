# Alert Distribution System🚨

- [Intro](#intro)
- [Overview](#overview)
- [Setup](#setup)
- [Notes](#notes)

## Intro

This system receives emergency alerts from various sources in real-time and transfers them to a vast number of clients, informing them of the danger⚠️.

## Overview

This repo consists of the built-in front-end React.js application, and a back-end, microservices-based Node.js server consisting of three microservices written in TypeScript.

### Alert Generator (alert-generator)🤖

A script that mimics a real-life alert resource.
Sends random alerts, at a frequency set by the user.
Written in TypeScript.

### Listener Microservice (listener-srv)📡

The data's entry point to the back-end.
Responsible for handling the HTTP requests containing the raw data sent from the source. The listener(s) listen to incoming data and enqueue it in the RabbitMQ message broker.

### RabbitMQ🐰

The message broker between the Listener and the Processor Microservice (see the following). It is deployed in the cluster within a deployment of its own.

### Processor Microservice (process-srv)⚙️

Processes the data by aggregating events using Redis, also responsible for handling data duplication. Fetches the data from RabbitMQ and transfers it to the Notify Microservice using Redis Pub-Sub functionality.

### Redis📩

Stores event data for event aggregation and is used as a message distributor to the Notify Microservice by broadcasting the messages to all the instances. It is deployed in the cluster within a deployment of its own.

### Notify Microservice (notify-srv)🔔

Informs the clients of new alerts by subscribing to Redis, getting the events' data from the designated channel which the events are published to by the Processor Microservice. Informs the clients of new alerts by leveraging the socket.io library.

## Setup

This guide assumes your React.js app has already been set up.
It also assumes you have Node.js and Docker installed on your PC (Docker's k8s engine was used for the development of this).

`git clone https://github.com/Falupi22/alert-system-exercise`

Now open cmd in the folder generated. Then type the following:

`cd backend`
`yarn install`

This should install all the modules of all the microservices.
The ports 30000 and 30001 were used arbitrarily for the entry point of some components in the system, but this can be changed by setting .env variables within the microservice/app folder or in the config file itself.

Hit `yarn dev` to run a single, local instance of each microservice.

A fully working system, receiving data, should result in the following:

![Web page](assets/live.png)

### Skaffold

Skaffold is an easy way to deploy the entire back-end as a local Kubernetes cluster using only one command! The skaffold.yaml file contains all the information necessary for deploying the app. It also watches for file changes and updates the cluster automatically.

To install - https://skaffold.dev/docs/install/

Once ready, make sure to locate yourself in ./backend, and then type
`skaffold dev`

It might take a few minutes, but once it's ready, it handles everything.
You can also check if the system is set up by typing in the cmd
`kubectl get all`

You should see the following:
![Healthy cluster](./assets/cluster.png)

## Notes

- The frontend was tweaked due to mismatching names of parameters within the task (sentTime - startTime, duration - endTime). I stuck with the names in the task.

- The port of the socket IO server has been replaced (4000-30001) for convenience issues (NodePort port is usually a 5-digit number).

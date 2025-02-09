# Alert Distribution System

- [Intro](#intro)
- [Overview](#overview)
- [Setup](#setup)
- [Notes](#notes)

## Intro

This system received emergency alerts from various sources in real-time and transfers them to vast number of clients, informing them of the danger.

## Overview

This repo consists of the built in front-end React.js application, and a back-end, microservices based Node.js server consists of three microservices written in typescript.

### Alert Generator (alert-generator)

A script which mimics a real-life alert resource.
Sends random alerts, in a frequency told by the user.
Written in typescript.

### Listener Microservice (listener-srv)

The data's entry point to the back-end.
Responsible for handling the HTTP requests containing the raw data sent from the source. The listener(s) listen to incoming data and enqueue it in the RabbitMQ message broker.

### Rabbit MQ

The message broker between the Listener and the Processor Microservice (see the following). It is being deployed in the cluster within a deployment of its own

### Processor Microservice (process-srv)

Processes the data by aggregating events using Redis, also responsible for handling data duplication. Fetches the data from the RabbitMQ and transfers it with the Notify Microservice using Redis Pub-Sub functionality.

### Redis

Stores event data for event aggregation and used as a message distributor to the Notify Microservice by broadcasting the messages to all the instances. It is being deployed in the cluster within a deployment of its own.

### Notify Microservice (notify-srv)

Informs the clients of new alerts by subscribing to Redis, getting the events' data from the designated channel which the events are published to by the Processor Microservice. Informs the clients of new alerts by leveraging socket.io library.

## Setup

This guide assumes your React.js app has already been set.
It also assumes you Node.js and Docker installed in your PC (Docker's k8s engine was used for the development of this).

`git clone https://github.com/Falupi22/alert-system-exercise
`

Now open cmd in the folder generated. Then type the following:

`cd backend`
`yarn install`

This should install all the modules of all the microservice.
The ports 30000 and 30001 were used arbitrarily for the entry point of some components in the system, but this can be change by setting .env variables within the microservice/app folder of in the config file itself.

Hit `yarn dev` for running a single, local instance of each microservice.

A full working system, receiving data, should result in the following:

![Web page](assets/live.png)

### Skaffold

Skaffold is an easy way to deploy the entire back-end as a local kubernetes cluster using only one command! skaffold.yaml file contains all the information necessary for deploying the app. It is also watching for file changing and updated the cluster automatically.

To install - https://skaffold.dev/docs/install/

Once ready, make sure to locate yourself in ./backend, and the type
`skaffold dev`

It might take a few minutes, but once it's ready, it handles everything.
You can also check if the system is set up by typing in the cmd
`kubectl get all`

You should see the following:
![Healthy cluster](./assets/cluster.png)

## Notes

The frontend was tweaked due to mismatching names of parameters within the task (sentTime - startTime, duration - endTime). I sticked with the names in the task.

The port of the socket IO server has been replaced (4000-30001) for convenience issue (NodePort port is usually a 5 digits number).

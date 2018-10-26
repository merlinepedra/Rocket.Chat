# WHAT?
its just a proposal, a test, we want support more and more cuncurrent users.

## HOW?!
Rocket.Chat has a lot of features and some of them need more priority... So We gonna split the code in services and priorize streams and basic conversation

## Some changes
We cant change all rocket.chat in one night so here its how I imaginated:
Split the code in services to allow scale just what we need

## rocket.chat.core
All methods (same os equivalent of Meteor.calls), but it gonna work as microservices.
So we can use this methods in any part of application

## rocket.chat.api
A service that provides all endpoints, using "rocket.chat.core" to fetch data and permissions

## rocket.chat.hub
A hub, that connect with the database (we can change the database in the future), that emits all streams we need
    - users data
    - permissions
    - messages
    - subscriptions
    - rooms

## rocket.chat.mqtt/rocket.chat.streamer
That service listen the events from hub and spread the information by channels
the test who can subscribe each channel, we gonna use "rocket.chat.core->authorization"

# control data

## Overview

Control data is used to give the agenda information used by widgets on the client side ( calendar, map, tags, categories ... )

Generating it on the fly works fine for small agendas as requests come in, but since all events of the agenda need to be processed each time, if the agenda grows in size, this become less viable.

Further on, for even bigger agendas, caching is not sufficient either as generating the first control data set takes too much time.

## Solution

Control data is now calculated on a worker server and refreshes a cached version only once the replacement is in hand. When an agenda is updated, the control data lib is notified and a task is queued for a refresh.

## Files

* **task.js**: this script listens to the queue and refreshes the cache as new jobs come in. It exposes the method to launch the task, shut it down and a method to enqueue jobs

* **getControlData**: exposes the method of the same name

* **index.js**: interface file
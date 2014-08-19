## coms

Module used by any module needing to publish or subscribe to application-wide message channels

2 types of communication are used:

* persistent consumer queue: used by mailer. On one side, mailer connects to the queue and keeps on popping items as they arrive by using the 'persistentConsume' method of coms. On the second side, any module needing to send email messages queues them with the 'queue' method of coms. The queue name for this is 'mailer'.

* channel publish / subscribe: the application wide channel is called 'main' and is used for applicative events ( for example: 'event.create', 'event.remove' ). Event originators use coms method 'publish' to push things on the channel. Listeners 'subscribe' to the channel to follow what is happening. A log stack piles anything that goes through here and dumps data regularly to the file system.
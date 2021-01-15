
The solution described here offers a method where tunnel pairs are opened to allow for communication between parent and child frame. If available, the solution uses HTML postmessage to send the information. If not, it fallsback on a hash based method.

Several tunnels can be opened in a single parent window to multiple child frames. There cannot be more than one tunnel pair per parent/child pair.

The processes described below offer a solution to the asymmetric nature of both postMessage and hash methods: when a child sends a message to a parent frame, all parent tunnels read that message, which is not the case the other way around. identification of tunnels must be established and attached to messages to target messages. The following sequences establish the process of applying these identifications as tunnels are initialized.

Handshake sequences: 
(paste on http://bramp.github.io/js-sequence-diagrams/  for diagram)

Title: Parent tunnel is loaded before child
Note left of Parent1: is loaded. Creates id.\nTunnel not ready
Parent1 -> Child1: handshake <id>
Note right of Child1: not ready yet.\nready message is lost.
Note right of Child1: is loaded\nChild is ready to receive!
Child1 -> Parent1: broadcast handshake
Parent1 -> Child1: handshake<id>
Note right of Child1: id is received and set\nTunnel is Ready to send!
Child1 -> Parent1: handshake<id>
Note left of Parent1: ready is received from child \nTunnel is ready to send and receive!


Title: Parent tunnel is loaded after child
participant Parent1
participant Child1
Note right of Child1: is loaded\nChild is ready to receive!
Child1 -> Parent1: broadcast handshake
Note left of Parent1: not loaded yet.\nbroadcast ignored
Note left of Parent1: is loaded\nCreates id.
Parent1 -> Child1: handshake<id> (forces)
Note right of Child1: id is received and set\nTunnel is Ready to send!
Child1 -> Parent1: handshake<id>
Note left of Parent1: ready is received from child \nTunnel is ready to send and receive!


Limitation of the hash fallback: if two hash changes happen too closely to one another, the change event is triggered twice but picks up only the second value.
A solution would be to timeshare the parent hash.
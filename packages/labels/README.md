# Overview

The OpenAgenda labels lib. This works both for server and front labels. Label files are independent from each other and can be loaded independently - so things can remain lightweight on the front side.

/makeLabelsGetter: takes a labels set to return a getLabel function
/flatten: flatten a labels set to a single language keyed list

## Crowdin

Label updates can be done in either the .crowdin folder or in the root files of the package. Creations must first be done in the root files.

Then a sync must be made:

If changes are made in the .crowdin folder, they are spread throughout the labels project using the `.crowdin/dispatch` script.

If they are made in the packages root files (outside .crowdin folder), then the `.crowdin/aggregate` script should be called to update the .crowdin folder.
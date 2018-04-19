# Overview

The preview widget allows you to add a preview of the events of your calendar on any webpage. A default widget showing the next 5 upcoming events of your calendar is loading by doing the following simple operation:

## Default Preview widget

Retrieve the uid of your agenda on your calendar page ( it is at the bottom of the sidebar of the agenda page, in gray with the notation `<uid:CALENDARUID>`, and edit the following code by replacing both CALENDARUID occurrences with your uid:

    <div class="oa-preview cbpgpr" data-oapr data-cbctl="CALENDARUID|en">
      <a href="https://openagenda.com/agendas/CALENDARUID">See the calendar</a>
    </div><script src="//openagenda.com/js/embed/oaPreviewWidget.js"></script>

The code is now ready to be added to the webpage of your choice.

## Simple customization

Here are simple operations for tweaking your widget:

 * Disabling the default style: if you want to use your own css stylesheet and do not want to use the default style of the widget, just remove the `oa-preview` class from the widget code. You can add any class you want to the <div> of the widget, but **never** remove the 'cbpgpr' class. It is used as anchor for the widget script.
 * Change the language of the widget by updating the second part of the data-cbctl attribute of the widget. Supported languages are 'en' or 'fr'.
 * Changing the count of displayed events: add a data-count attribute with the number of events you want ( ex: data-count="2" )
 * If you have an integrated OpenAgenda calendar and you want the widget links to point to it rather than to the OpenAgenda calendar page, replace the href attribute of the <a> element inside the widget with the url of your integrated calendar page.


## Advanced customization: events filtering

You can bypass the default data load and use your calendar search and filtering features by specifying a `data-json` attribute with the value set to the json export of your calendar. The easiest way to define the json url is to do the following:

 * go to your OpenAgenda calendar page,
 * filter your events by using the page controls to match the desired filter
 * click on the 'Export' button
 * click on the JSON button in the 'export your latest search' section


## Advanced customization: templating

You can define your own template in the body of the widget, commented below the calendar link. The template engine language used is a clone of the one used by **Tumblr**. The following example illustrates how to build a template:


    <div class="oa-preview cbpgpr" data-oapr data-cbctl="CALENDARUID|en">
      <a href="https://openagenda.com/agendas/CALENDARUID">See the calendar</a>
      <!-- 
        Total upcoming events: {TotalEvents}
        <ul>
          {block:Events}
          <li>
            <a href="{Link}">
              <span class="title">{Title}</span>
              {block:ImageUrl}
              <img src="{ImageUrl}"/>
              {/block:ImageUrl}
              <span class="desc">{Description}</span>
              <span class="range">{DateRange}</span>
              <span class="place">{LocationName}</span>
            </a>
          </li>
          {/block:Events}
        </ul>
      -->
    </div><script src="//openagenda.com/js/embed/oaPreviewWidget.js"></script>

How the template engine works in 3 points:

 * Values are printed by using the following synthax: {ValueName}
 * Lists of values can be printed in a loop by using the {block:ValueGroup} synthax. Encase a sub-template in the block to print the values of each item of the list. Here, {block:Events} is the only list block.
 * The block notation can also be used as a regular value condition: if the value is set, the content of the block will be printed. See ImageUrl in the above example.

Here is a list of the values that can be used in the template:

 * **TotalEvents**: The total of the current selection of events.
 * **Events**: The list of events to be printed in the widget. Used as a block only.
 * **Title**: Title of an event
 * **Description**: Short description of an event
 * **Link**: Link to the event
 * **ImageUrl**: Url of the image of the event
 * **ThumbnailUrl**: Url of the thumbnail of the event
 * **LocationName**: Name of the venue of the event
 * **City**: City of the venue of the event
 * **PricingInfo**: Conditions of access to the event
 * **TicketUrl**: Reservation link to the event

## Troubleshoot

 If for some reason your CMS or website filters out the classes of your widget, the script will not be able to attach to the widget. Add the `data-oapr` attribute to the div of the widget code, it will be used as a backup anchor.
# Overview

This service replaces the embed save features implemented in php.

get, update and create need to be implemented

## Data structure

```
+------------+-------------+------+-----+---------+----------------+
| Field      | Type        | Null | Key | Default | Extra          |
+------------+-------------+------+-----+---------+----------------+
| id         | bigint(20)  | NO   | PRI | NULL    | auto_increment |
| review_id  | bigint(20)  | NO   | MUL | NULL    |                |
| owner_id   | bigint(20)  | NO   | MUL | NULL    |                |
| uid        | bigint(20)  | YES  | UNI | NULL    |                |
| store      | longtext    | YES  |     | NULL    |                |
| created_at | datetime    | NO   |     | NULL    |                |
| updated_at | datetime    | NO   |     | NULL    |                |
| version    | smallint(6) | YES  |     | 2       |                |
| template   | text        | YES  |     | NULL    |                |
| mapping    | text        | YES  |     | NULL    |                |
+------------+-------------+------+-----+---------+----------------+
```

Most config is stored in store, using a php serialize / unserialize method -> need locutus https://locutus.io/php/

Values stored:

 * lang: ('fr')
 * layout.layoutmode: string (values: 'standard', 'tiled', 'cascading', 'nocss')
 * layout.autoscroll: boolean, true by default
 * layout.synchref: boolean, true by default
 * siteurl: link or empty string (for shares)
 * facebookappid: string, defaults at false
 * layout.shares `{ fb, tw, gp, li, tu, pi, em }`
 * layout.use_event_slug: boolean
 * layout.use_default_css: `{ list, map, search, categories, tags, calendar, form }`

 * layout.mapTiles : text or false
 * layout.mapIcons { active: string or false, inactive: string or false}
 * layout.mapIconSizes { active: array or false, inactive: array or false }
 * layout.tmpMapIcons
 * layout.tmpMapIconSizes

 * layout.mapPositionMode: 'all' or 'manual'
 * layout.mapAuto: boolean
 * layout.mapCorners: `{ neLat, neLng, swLat, swLng }` ou chaine de caractère vide

 * layout.linkcss: optional link or empty string
 * layout.customcss: text or empty string
 

Not used anymore (should be frozen)

 * layout.catClasses
 * eventitemorders
 * epp: events per page (integer)
 * fontfamily
 * fontsize
 * layout.pres
 * layout.order
 * layout.color
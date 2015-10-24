## Requirements List
*Note:* the following set of requirements use generic nomeclature. For the scope of the app the nomeclature may change but this
should not have any affect on scope or requirements.

Please only look at where the Version column is labeled as "v1". All other requirements should be ignored at this time and should only be used for planning future functionality.

### Requirements Table

| Screen          | Description                                            | Version | Priority | Notes               |
| ---             | ---                                                    | --      | ---      | ---                 |
| Intro Animation | replayable animation                                   | v1      | M        | Headspace           |
| Interest List   | select list of interests                               | v1      | M        |                     |
| Profile Picture | upload image                                           | v1      | M        |                     |
| Username        | pick username                                          | v1      | M        |                     |
| Username        | generate username                                      | v2      | M        | website same as app |
| Login           | login not required, use device id                      | v2      | M        | website same as app |
| Login           | facebook login                                         | v1      | M        |                     |
| Login           | twitter login                                          | v2      | M        |                     |
| Login           | instagram login                                        | v2      | M        |                     |
| Posts           | sort posts based on relevancy                          | v1      | M        |                     |
| Posts           | filter posts based on tags                             | v2      | M        | change to global    |
| Posts           | filter posts based on keywords                         | v1      | M        |                     |
| Posts           | filter posts based on location (nearby)                | v2      | M        | change to global    |
| Posts           | ask location permission when filtering (nearby)        | v1      | M        |                     |
| Posts           | filter posts based on location (city)                  | v1      | M        |                     |
| Posts           | post posting time                                      | v1      | M        |                     |
| Posts           | show avatar thumbnail of user of post                  | v1      | M        |                     |
| Posts           | show attached image thumbnail of post                  | v1      | C        |                     |
| Posts           | add new post button                                    | v1      | M        |                     |
| Posts           | sound when new post button is clicked                  | v2      | C        | Hangouts            |
| Posts           | flag potentially offensive post via report             | v1      | M        |                     |
| New Post        | back button to cancel post                             | v1      | M        |                     |
| New Post        | select privacy everyone (how to select private)        | v2      | M        |                     |
| New Post        | enter new post                                         | v1      | M        |                     |
| New Post        | attach photos                                          | v1      | M        |                     |
| New Post        | automatically suggest tags                             | v2      | M        |                     |
| New Post        | manually select tags if none found                     | v1      | M        |                     |
| New Post        | update tag list from server side for quick update      | v1      | M        |                     |
| Settings        | edit profile                                           | v1      | M        |                     |
| Settings        | edit username                                          | v1      | M        |                     |
| Settings        | edit email address                                     | v1      | M        |                     |
| Settings        | edit one liner profile description                     | v1      | M        |                     |
| Settings        | edit user photo                                        | v1      | M        |                     |
| Settings        | edit interests                                         | v1      | M        |                     |
| Settings        | facebook connect                                       | v1      | M        |                     |
| Settings        | twitter connect                                        | v2      | M        |                     |
| Settings        | instagram connect                                      | v2      | M        |                     |
| Settings        | phone connect                                          | v2      | M        |                     |
| Settings        | ask phone permissions during phone connect             | v2      | M        |                     |
| Settings        | information about lighttribe                           | v1      | M        |                     |
| Settings        | future feature information                             | v1      | M        |                     |
| Settings        | replay intro video                                     | v2      | M        |                     |
| Settings        | invite users via SMS                                   | v1      | M        |                     |
| Settings        | invite users via email                                 | v1      | M        |                     |
| Post            | display time post occurred                             | v1      | M        |                     |
| Post            | display text of post                                   | v1      | M        |                     |
| Post            | display avatar thumbnail of user who posted            | v1      | M        |                     |
| Post            | display avatar thumbnail of any reply                  | v1      | M        |                     |
| Post            | display text of any reply                              | v1      | M        |                     |
| Post            | flag/report post of user                               | v1      | M        |                     |
| Post            | upvote post of user                                    | v1      | M        |                     |
| Post            | downvote post of user                                  | v2      | W        |                     |
| Post            | reply to post of user                                  | v1      | M        |                     |
| Post            | flag reply of user                                     | v2      | M        |                     |
| Post            | upvote reply of user                                   | v2      | M        |                     |
| Post            | downvote reply of user                                 | v2      | C        |                     |
| Post            | save upvote into database for future use               | v1      | C        |                     |
| Post            | display upvote/downvote number of post to user         | v2      | C        |                     |
| Post            | display upvote/downvote number of reply to user        | v2      | C        |                     |
| Post            | click user takes you to profile                        | v1      | M        |                     |
| User Profile    | shows thumbnail of user                                | v1      | M        |                     |
| User Profile    | display last seen of user                              | v2      | M        |                     |
| User Profile    | display recent posts of user                           | v1      | M        |                     |
| User Profile    | display thumbnail of user for recent post              | v2      | W        |                     |
| User Profile    | display relative size text cloud for subject of posts  | v1      | M        |                     |
| Messages        | send user a message via the user profile               | v1      | M        |                     |
| Messages        | list all conversations you have engaged in             | v1      | M        |                     |
| Messages        | check new messages less than every 30 seconds          | v1      | M        |                     |
| Messages        | use event handler for checking messages                | v2      | S        |                     |
| Messages        | server should auto-resolve conversation ids            | v2      | S        |                     |
| Messages        | show user thumbnail when relavent if enough space      | v1      | M        |                     |
| Messages        | show username when relavent if enough space            | v1      | M        |                     |
| Messages        | show text body of the conversation                     | v1      | M        |                     |
| Messages        | show date of the conversation if space exists          | v2      | M        |                     |
| LightPage       | user can enter their name                              | v1      | M        |                     |
| LightPage       | user can enter address components                      | v1      | M        |                     |
| LightPage       | user can add website                                   | v1      | M        |                     |
| LightPage       | user can choose from a eventType dropdown              | v1      | M        |                     |
| LightPage       | event type dropdown update from backend                | v1      | M        |                     |
| LightPage       | user can enter short description field                 | v1      | M        |                     |
| LightPage       | user can enter long description field                  | v1      | M        |                     |
| LightPage       | user can attach image                                  | v1      | M        |                     |
| LightPage       | Anonymous users can't post a LightPage                 | v1      | M        |                     |
| LightPage       | user can fill in start datetime via iPhone controls    | v1      | M        |                     |
| LightPage       | user can fill in end datetime via iPhone controls      | v1      | M        |                     |
| LightPage       | user can pick location of event                        | v1      | M        |                     |
| LightPage       | user can pick radius of the post                       | v1      | M        |                     |
| LightPage       | user can pick interest/category of post                | v1      | M        |                     |
| LightPage       | user can publish lightPage post                        | v1      | M        |                     |
| LightPage       | user can share post to Facebook with link to app store | v1      | M        |                     |
| LightPage       | user can save post for later publishing                | v1      | M        |                     |
| LightPage       | user can see list of saved posts from dashboard        | v1      | M        |                     |
| LightPage       | user can pick saved post in dashboard and re-publish   | v1      | M        |                     |
| Followers       | user can follow another user from their profile page   | v1      | M        |                     |
| Followers       | user does not have to follow back                      | v1      | M        | instagram logic     |
| Followers       | user can see list of people they are following         | v1      | M        |                     |
| Followers       | clicking on user takes them to their profile           | v1      | M        |                     |
| Followers       | user can stop following at any time                    | v1      | M        |                     |
| Followers       | after stop following, user could re-add at anytime     | v1      | M        |                     |
| Future          | pay for radius, higher radius means more visibility    | v?      | W        | convo with Corame   |
| Future          | pay per click, when people click we charge             | v?      | W        | convo with Corame   |
| Future          | boost smaller festivals at first                       | v?      | W        | convo with Corame   |
| Future          | admin panel can ignore large festivals like Coachella  | v?      | W        | convo with Corame   |
| Future          | boost cultural festivals                               | v?      | W        | convo with Corame   |
| Future          | automatic and scheduled posting for user               | v?      | W        | convo with Corame   |
| Future          | automatic and scheduled posting for backend user       | v?      | W        | convo with Corame   |
| Future          | allow users to sell tickets on lightpage               | v?      | W        | convo with Corame   |
| Future          | allow users to buy tickets from LightPage              | v?      | W        | convo with Corame   |
| Future          | sell user data                                         | v?      | W        | convo with Corame   |
| Future          | analyze user data to help markets target customers     | v?      | W        | convo with Corame   |
| Future          | use a backoffice in phillipines to process translation | v?      | W        | convo with Corame   |
| Future          | apple watch with most recent posts in area             | v?      | W        | convo with Corame   |
| Future          | integrate a dating app directly into this app          | v?      | W        | convo with Corame   |
| Future          | link a dating app from this app                        | v?      | W        | convo with Corame   |
| Future          | dating app shares profile between two apps             | v?      | W        | convo with Corame   |
| Future          | initiate a date from LightTribe app into dating app    | v?      | W        | convo with Corame   |
| Future          | separate dating profile between the two apps           | v?      | W        | convo with Corame   |
| Future/path evo | integrate game into app (path of evolution)            | v?      | W        | convo with Corame   |
| Future/path evo | have users ask questions daily                         | v?      | W        | convo with Corame   |
| Future/path evo | outcomes have positive minus score, positive doubled   | v?      | W        | convo with Corame   |
| Future/path evo | tribes are chosen on a map                             | v?      | W        | convo with Corame   |
| Future/path evo | unforseen hurdles and bonuses on the map               | v?      | W        | convo with Corame   |
| Future/path evo | user gains badges depending on balance and evo         | v?      | W        | convo with Corame   |
| Future/path evo | points give achievement or move you away from target   | v?      | W        | convo with Corame   |
| Future          |                                                        | v?      | W        | convo with Corame   |

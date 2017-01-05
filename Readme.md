# Page with datetime and Uni-Koblenz Mensaplan
![Screenshot of the tab](screenshot.jpg?raw=true "Screenshot")

The plan is taken from `http://www.studierendenwerk-koblenz.de/api/speiseplan/speiseplan.xml`.

## Use as "new tab"-page in chrome
* Download an addon to change the new tab url, for example [New Tab Redirect](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna?hl=de)
* Change the url to point to `https://datetimemensa.cars10k.de`
* .. or host yourself

## Hosting manually
You need to:

1. host the assets
2. pull the `speiseplan.xml`
3. fix the links to the xml (see `index.html`)

### Host the assets
All you need is a static asset server, for example nginx or similiar. To host locally you could use something like the python http server:
```
# will start a local fileserver on port 8001
python -m http.server 8001
```
### Pull the plan
You can use the provided `pull_plan.sh` to pull the `speiseplan.xml` file.
I did setup a cronjob that runs every 30min between `9:00am` and `11:00am` because thats the timeframe where the plan usally gets updated.

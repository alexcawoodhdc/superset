# Local Development
### Setup
1. Ensure you have Node.js v20+ and npm v10+
```
node --version
npm --version
```
2. Clone this repo
3. Install the dependencies. There will be lots of messages to ignore, and it takes a while.
```
cd superset/superset-frontend
npm ci
```
4. Verify that the plugin is installed. You should see `plugin-hdc-mapbox-geofence` listed,
```
ls node_modules/@superset-ui/
```
5. Run the front-end, making use of the back-end resources that are already deployed. Ensure you're in the superset/superset-frontend directory.
```
npm run dev-server -- --env=--superset=http://{ip:8088}/
```

View your front-end at `localhost:9000`

Default credentials are `admin/admin`
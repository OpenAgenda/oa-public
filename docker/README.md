# Install OA for development with Docker

## Requirements

 * Check that your current nginx service is off.
 * That the domain you intend to use points to the localhost in `/etc/hosts`
 * Check you have docker v19.03.8 docker-compose v1.25.5 installed
 * Lots of free disk space (20GB+)

## Get the projects

Git clone the following:

 * oa
 * cibul-symfony
 * cibulapi-symfony

Create an empty folder for hosting mysql data. Take a note of the path.

Put a db dump somewhere. Take a note of the path.

## Create the .env file

Use the .env.sample file:

```shell script
cp .env.sample .env
```

Edit it, follow the instructions in comments.

## Run the devinstaller

In the terminal and at the project root, run:

```shell script
chmod +x docker/devinstaller/run.sh
./docker/devinstaller/run.sh
```

Once the installation is complete, the process should exit.

Add authority certificate to Ubuntu CA store with:

```shell script
sudo cp docker/devinstaller/ssl/certs/ca.crt /usr/share/ca-certificates/auth.openagenda.crt
sudo chmod 644 /usr/share/ca-certificates/auth.openagenda.crt
sudo dpkg-reconfigure ca-certificates # choose yes and check auth.openagenda.com
sudo update-ca-certificates

# or (non-interactive)

sudo cp docker/devinstaller/ssl/certs/ca.crt /usr/local/share/ca-certificates/auth.openagenda.crt
sudo chmod 644 /usr/local/share/ca-certificates/dev/auth.openagenda.crt
sudo update-ca-certificates
```

And import manually `ca.crt` in Chrome and/or Firefox.

## Launch OpenAgenda

Run the rest and brace yourself:

```shell script
docker-compose up
```

If nothing melted, try it in detached mode:

```shell script
docker-compose -d up
```

## Useful

View `node` logs without deamon (hide logs from other services):

```shell script
docker-compose up nginx node
```

Force recreate containers:

```shell script
docker-compose up --force-recreate
# or with daemon
docker-compose up -d --force-recreate
```

View `node` logs when daemon is launched:

```shell script
docker-compose logs -f --tail=100 node
```

Restart node:

```shell script
docker-compose restart node
```

Watch mode:

```shell script
docker-compose -f docker-compose.yml -f docker-compose.watch.yml up
# or with daemon
docker-compose -f docker-compose.yml -f docker-compose.watch.yml up -d
```

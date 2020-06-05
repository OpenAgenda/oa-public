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

    cp .env.sample .env

Edit it, follow the instructions in comments.

## Run the devinstaller

In the terminal and at the project root, run:

    sudo docker-compose up devinstaller

Once the installation is complete, the process should exit. Run the rest and brace yourself:

    sudo docker-compose up

If nothing melted, try it in detached mode:

    sudo docker-compose -d up

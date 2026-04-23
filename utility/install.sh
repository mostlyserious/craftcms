function get_op() {
    op item get 'ENVIRONMENT_DEFAULTS' --fields=label=$1 --reveal --account=mostlyserious.1password.com --vault=Employee
}

if ! command -v ddev &> /dev/null
then
    echo "DDEV not found."
    exit 1
fi

# @todo: check if we can collect Fort Awesome token up-front

cp .env.example .env
ddev dotenv set .env --primary-site-url="https://$(basename $PWD).ddev.site"
ddev dotenv set .env --imgix-url="https://$(basename $PWD).imgix.net"
ddev config --project-name=$(basename $PWD)
ddev start
ddev composer update
ddev craft setup/keys
ddev craft install/craft
bun install

if command -v op &> /dev/null
then
    ddev dotenv set .env --tinypng-key=$(get_op TINYPNG_KEY)
    bun run build
else
    echo "1Password CLI not found."
    echo "Install it for a better experience. https://developer.1password.com/docs/cli/get-started/"
fi

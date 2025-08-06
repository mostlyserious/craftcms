function set_env() {
    sed -i "" "s#^${1}=.*#${1}=\"${2}\"#" .env
}

function get_op() {
    op item get 'ENVIRONMENT_DEFAULTS' --fields=label=$1 --reveal --account=mostlyserious.1password.com --vault=Employee
}

cp .env.example .env
set_env PRIMARY_SITE_URL "https://$(basename $PWD).ddev.site"
set_env IMGIX_URL "https://$(basename $PWD).imgix.net"
ddev config --project-name=$(basename $PWD)
ddev start
ddev composer update
ddev craft setup/keys
ddev craft install/craft
ddev craft update --interactive=0
ddev bun update

if command -v op &> /dev/null
then
    set_env TINYPNG_KEY $(get_op TINYPNG_KEY)
    ddev bun run build
else
    echo "1Password CLI not found."
    echo "Install it for a better experience. https://developer.1password.com/docs/cli/get-started/"
fi

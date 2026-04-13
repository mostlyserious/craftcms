function set_env() {
    sed -i "" "s#^${1}=.*#${1}=\"${2}\"#" .env
}

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
set_env PRIMARY_SITE_URL "https://$(basename $PWD).ddev.site"
set_env IMGIX_URL "https://$(basename $PWD).imgix.net"
ddev config --project-name=$(basename $PWD)
ddev start
ddev composer update
ddev craft setup/keys
ddev craft install/craft
bun install

if command -v op &> /dev/null
then
    set_env TINYPNG_KEY $(get_op TINYPNG_KEY)
    bun run build
else
    echo "1Password CLI not found."
    echo "Install it for a better experience. https://developer.1password.com/docs/cli/get-started/"
fi

echo ""
echo "Container JavaScript dependencies are installed."
echo "Run 'ddev mutagen reset' if this project's Mutagen configuration changes after pulling updates."
echo "Run 'bun install' on the host as well if you want IDE tooling to resolve local formatter, linter, and language-server binaries."

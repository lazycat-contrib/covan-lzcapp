# Covan for LazyCat

LazyCat LPK v2 packaging for [Covan](https://github.com/covan-ai/covan): a shared AI agent for a team, with private conversations and collaborative training.

## Runtime

This single-instance package runs the two published Covan `0.1.0` images with the trimmed self-hosted Supabase stack from upstream: PostgreSQL, GoTrue, PostgREST, Realtime, Kong, and the migration runner. nginx and certbot are not used.

All runtime images are pinned to verified linux/amd64 digests behind registry mirrors. `supabase/postgres:17.6.1.136` is served through `dockerproxy.net` because that exact historical tag is not available from `docker.1ms.run`; the remaining Docker Hub images use `docker.1ms.run`, and Covan images use `ghcr.1ms.run`.

Database and uploaded document data live under `/lzcapp/var/covan`. The packaged SQL migrations and initialization scripts come from upstream tag `v0.1.0`; the network-facing secret guard is synchronized from upstream's current self-host configuration.

## Setup

Before deployment, generate a Supabase JWT secret and matching `anon` and `service_role` JWTs. The setup wizard also asks for an OpenAI API key. Successful account registration or login is captured for later passwordless autofill.

Covan uploads and downloads are integrated with the LazyCat file picker injection.

## Build

```sh
lzc-cli project release -o dist/application.lpk
```

## GitHub Actions

The scheduled workflow follows stable SemVer tags for both `covan-api` and `covan-web`, creates a versioned GitHub Release asset, and publishes only to the MiaoMiao private store.

Required repository or organization Secrets:

- `APPSTORE_URL`
- `APPSTORE_TOKEN`

Optional Secrets:

- `APP_ID`
- `PRIVATE_STORE_GROUP_CODES`

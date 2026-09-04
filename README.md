# Covan for LazyCat

LazyCat LPK v2 packaging for [Covan](https://github.com/covan-ai/covan): a shared AI agent for a team, with private conversations and collaborative training.

## Runtime

This single-instance package runs the two published Covan `0.1.0` images with the trimmed self-hosted Supabase stack from upstream: PostgreSQL, GoTrue, PostgREST, Realtime, Kong, and the migration runner. nginx and certbot are not used.

All runtime images use explicit version tags behind registry mirrors. `supabase/postgres:17.6.1.136` is served through `dockerproxy.net` because that exact historical tag is not available from `docker.1ms.run`; the remaining Docker Hub images use `docker.1ms.run`, and Covan images use `ghcr.1ms.run`.

Database and uploaded document data live under `/lzcapp/var/covan`. The packaged SQL migrations, initialization scripts, and Kong configuration come from upstream tag `v0.1.0`.

## Setup

The setup wizard includes a matching, usable default Supabase JWT secret and `anon`/`service_role` JWT pair. These defaults are part of this public repository and are intended only for a private deployment; replace all three together before exposing Covan to an untrusted network. A startup guard verifies their algorithm, role, expiry, and HMAC signature before the database starts. The wizard also asks for an OpenAI API key. Successful account registration or login is captured for later passwordless autofill.

Covan uploads and downloads are integrated with the LazyCat file picker injection.

## Build

```sh
lzc-cli project release -o dist/application.lpk
```

## GitHub Actions

The tag workflow creates a versioned GitHub Release asset and publishes only to the MiaoMiao private store. Runtime images and vendored database/Kong assets are intentionally pinned to upstream `0.1.0`; an upgrade must update all of them together before pushing the matching packaging tag.

Required repository or organization Secrets:

- `APPSTORE_URL`
- `APPSTORE_TOKEN`

Optional Secrets:

- `APP_ID`
- `PRIVATE_STORE_GROUP_CODES`

## Project

- Url shortener
- Simple dashboard WITH AUTH with CRUD for users and urls.
- I want a simple workflow to add a new shhort url for an existing url so I can use different urls for the same content.
- I want to be able to track the number of clicks on the short urls, use Umami for analytics using their node client https://umami.is/docs/api/node-client
- I want to be able to track multiple shortened urls for the same long url but pass additional data to the analytics. For example:
    -  UTM params 
    -  So Short url 1 is just the base url, short url 2 is the base url with utm params. -- these should both show up as the same url in umami but with the utm params passed to the analytics.
 -  Urls should be as short as possible, but memorable. The root url will be jmd.to, will be added via env. This domain will only be used for url shortening so do jmd.to/<pattern> for the urls
 -  Redirects should be 301 permanent redirects. They should happen server-side, and instantly.
 -  I don't want a separate front-end, just a classic multi-page app built with plain html, css, and javascript.
 -  Add tests for the server-side code using vitest.
 -  Add CI in github.


## Tech Stack

- Fastify
- Prisma
- PostgreSQL
- Locally use docker-compose for dev, in prod I'll run those in Coolify so make sure I can set them via env.
- Vitest for unit testing
- Typescript

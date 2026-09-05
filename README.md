# Banshikha Kumari Portfolio

## Stack
HTML + CSS + JavaScript + Node.js + Express.

## Resume privacy flow

There is NO recruiter password.

1. Recruiter visits Contact.
2. Recruiter submits name, email and reason for requesting the resume.
3. The request is stored privately on the backend.
4. You open `/admin`.
5. You enter your private `ADMIN_KEY`.
6. You approve or deny the request.
7. On approval, a temporary resume URL is generated.
8. Send that URL to the recruiter.
9. The link expires after 24 hours.

The PDF is stored in `private/`, not `public/`, so it is not directly web-accessible.

## Local setup

```bash
npm install
```

Create `.env`:

```env
PORT=3000
BASE_URL=http://localhost:3000
ADMIN_KEY=put-a-long-random-secret-here
```

Put the resume at:

```text
private/Banshikha_Resume.pdf
```

Run:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## Render deployment

Create a Render Web Service from this GitHub repository.

Build Command:

```text
npm install
```

Start Command:

```text
npm start
```

Environment variables:

```text
BASE_URL=https://your-service-name.onrender.com
ADMIN_KEY=your-long-random-secret
```

After deployment, open:

```text
https://your-service-name.onrender.com/admin
```

### Important production note

The sample stores requests in a JSON file. On hosting platforms with ephemeral filesystems, that is not a durable production database. For a real deployment, use a persistent database such as MongoDB Atlas/Supabase/Postgres. The private-token design should also use HTTPS, rate limiting and short-lived tokens.

## Links

GitHub: https://github.com/banshikha

LinkedIn: https://www.linkedin.com/in/banshikha-kumari-970a6b303

Email: banshikabn12@gmail.com

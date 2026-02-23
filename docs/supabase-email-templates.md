# Supabase Email Templates Configuration

Configure these email templates in your Supabase Dashboard:
**Authentication → Email Templates**

## Brand Guidelines

- **From Name**: Pet ShareLink
- **From Email**: noreply@petsharelink.com (or your domain)
- **Primary Color**: #0d9488 (teal-600)

---

## 1. Confirm Signup

**Subject**: Confirm your Pet ShareLink account

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🐾</span>
          <h1 style="margin: 8px 0 0; font-size: 24px; color: #0d9488;">Pet ShareLink</h1>
        </div>

        <!-- Content -->
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a; text-align: center;">
          Welcome! Confirm your email
        </h2>
        <p style="margin: 0 0 24px; color: #666; line-height: 1.6; text-align: center;">
          Thanks for signing up! Click the button below to confirm your email and start organizing your pet's care info.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Confirm Email
          </a>
        </div>

        <p style="margin: 0; color: #999; font-size: 14px; text-align: center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          © 2025 Pet ShareLink. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password

**Subject**: Reset your Pet ShareLink password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🐾</span>
          <h1 style="margin: 8px 0 0; font-size: 24px; color: #0d9488;">Pet ShareLink</h1>
        </div>

        <!-- Content -->
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a; text-align: center;">
          Reset your password
        </h2>
        <p style="margin: 0 0 24px; color: #666; line-height: 1.6; text-align: center;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <p style="margin: 0 0 12px; color: #999; font-size: 14px; text-align: center;">
          This link expires in 24 hours.
        </p>
        <p style="margin: 0; color: #999; font-size: 14px; text-align: center;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          © 2025 Pet ShareLink. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link

**Subject**: Your Pet ShareLink login link

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🐾</span>
          <h1 style="margin: 8px 0 0; font-size: 24px; color: #0d9488;">Pet ShareLink</h1>
        </div>

        <!-- Content -->
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a; text-align: center;">
          Your login link
        </h2>
        <p style="margin: 0 0 24px; color: #666; line-height: 1.6; text-align: center;">
          Click the button below to sign in to your Pet ShareLink account. No password needed!
        </p>

        <!-- Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Sign In
          </a>
        </div>

        <p style="margin: 0; color: #999; font-size: 14px; text-align: center;">
          This link expires in 1 hour and can only be used once.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          © 2025 Pet ShareLink. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Invite User (for collaborator invitations)

**Subject**: You've been invited to help care for a pet on Pet ShareLink

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🐾</span>
          <h1 style="margin: 8px 0 0; font-size: 24px; color: #0d9488;">Pet ShareLink</h1>
        </div>

        <!-- Content -->
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a; text-align: center;">
          You're invited!
        </h2>
        <p style="margin: 0 0 24px; color: #666; line-height: 1.6; text-align: center;">
          Someone has invited you to help manage their pet's care information on Pet ShareLink. Click below to accept the invitation.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Accept Invitation
          </a>
        </div>

        <p style="margin: 0; color: #999; font-size: 14px; text-align: center;">
          This invitation expires in 7 days.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          © 2025 Pet ShareLink. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Configuration Steps

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. For each template type:
   - Paste the HTML into the "Body" field
   - Update the "Subject" line
5. Click **Save**

## Custom SMTP (Recommended for Production)

For better deliverability, configure a custom SMTP provider:

1. Go to **Project Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Enable "Custom SMTP"
4. Configure with your email provider (e.g., Resend, SendGrid, Postmark)

Recommended providers:
- **Resend** - Simple, developer-friendly
- **Postmark** - Excellent deliverability
- **SendGrid** - Feature-rich, good free tier

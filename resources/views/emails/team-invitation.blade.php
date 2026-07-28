<x-mail::message>
# You're Invited to Join {{ config('app.name') }}!

Hi there,

You have been invited to join the **{{ config('app.name') }}** staff team as a **{{ $invitation->role }}**.

Your account will grant you access to the {{ config('app.name') }} administration portal with the permissions and tools assigned to your role.

<x-mail::button :url="$url" color="primary">
Accept Invitation & Set Up Account
</x-mail::button>

---

**What happens next?**

1. Click the button above to open your secure invitation page.
2. Enter your name and choose a password for your account.
3. You will be logged in automatically and taken to your dashboard.

---

> **⏳ This invitation expires in 7 days** — on **{{ $invitation->expires_at->toDayDateTimeString() }}**.
> After expiration, an administrator will need to resend the invitation.

If you did not expect this email or believe it was sent in error, please ignore it. No account will be created unless you click the link above.

For support, please contact your administrator.

Thanks,<br>
**The {{ config('app.name') }} Team**

<small style="color:#9ca3af;">This is an automated message. Please do not reply directly to this email.</small>
</x-mail::message>

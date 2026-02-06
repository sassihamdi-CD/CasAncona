# Push this project to your GitHub repo (CasAncona)

## What’s already done

- **Git is set up** – global user: `sassihamdi-CD`, email: `hamdysassy7@gmail.com`
- **This project is a Git repo** – initial commit is done (113 files)
- **Remote is set** – `origin` → `git@github.com:sassihamdi-CD/CasAncona.git`
- **Branch** – `master` (matches GitHub’s default)
- **`.env` is not in the repo** – it’s in `.gitignore`, so secrets won’t be pushed

## What you still need to do: push from your terminal

The repo **CasAncona** is already created on GitHub. Push must be done from **your own terminal** (so your GitHub auth is used).

**Run this in your terminal:**

```bash
cd /Users/scalara/Desktop/cas-office-website
git push -u origin master
```

---

### If you use SSH (recommended if you have a key on GitHub)

- Your remote is already **git@github.com:sassihamdi-CD/CasAncona.git**
- If push says **Permission denied (publickey)**: add your SSH key to GitHub  
  → GitHub → **Settings** → **SSH and GPG keys** → **New SSH key** → paste your public key (`cat ~/.ssh/id_ed25519.pub` or `cat ~/.ssh/id_rsa.pub`)
- Then run `git push -u origin master` again

---

### If you prefer HTTPS (username + token)

1. **Switch remote to HTTPS:**
   ```bash
   cd /Users/scalara/Desktop/cas-office-website
   git remote set-url origin https://github.com/sassihamdi-CD/CasAncona.git
   ```

2. **Create a Personal Access Token:**  
   GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → Generate (with **repo** scope). Copy the `ghp_...` token.

3. **Push:**
   ```bash
   git push -u origin master
   ```
   When asked: **Username** = `sassihamdi-CD`, **Password** = paste the token (not your GitHub password).

---

## Summary

- **Repo on GitHub:** `sassihamdi-CD/CasAncona` (already created)
- **Local:** remote = `git@github.com:sassihamdi-CD/CasAncona.git`, branch = `master`
- **You do:** open Terminal, `cd` to the project, run **`git push -u origin master`**. Use SSH key or HTTPS + token if prompted.

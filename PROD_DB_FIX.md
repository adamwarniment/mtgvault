# Fix 500 Error in PROD (Database Schema Sync)

The 500 error in PROD is happening because the database is missing the new `pageLabels` field that we added to the code. Since we haven't created a formal migration file for this change, the deployment didn't automatically update the database.

You can fix this by manually syncing the database schema on your production server, just like we did locally.

## Fix via Portainer

Since you are using Portainer, you can run the fix directly inside the container using the web interface.

1.  **Log in to Portainer.**
2.  **Navigate to your Container List.**
3.  **Find the API container.** It will likely be named something like `mtgvault-api-1` or similar.
4.  **Click the ">_ Console" icon** (usually next to the container name) to open a terminal session inside that container.
5.  **Click "Connect"** (default settings `custom` or `/bin/sh` or `/bin/bash` are usually fine).
6.  **Run the following command** in the terminal window that opens:

    ```bash
    npx prisma db push
    ```

    You should see output indicating that the database is being synced and the `pageLabels` field is being added.

7.  **Restart the Container:** Once the command finishes successfully, close the console and restart the API container from the Portainer list to ensure everything loads cleanly.

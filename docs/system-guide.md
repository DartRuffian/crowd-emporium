# Systems Guide
This page will cover how to set up the development environment for Crowd Emporium.

The following are the basic requirements for the software, which will be expanded upon below:
- [Python v3.12.3](https://www.python.org/downloads/release/python-3123/)
- [PostgreSQL v16.2](https://www.postgresql.org/download/windows/)
- [Flyway v10.7.1](https://flywaydb.org/download/thankyou?dl=https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline/10.7.1/flyway-commandline-10.7.1-windows-x64.zip)

Versions other than the ones specified here *may* work, but are not guaranteed.

## Installation
### 1. Basic steps
1. Clone the repository;
   - Clone the repository in whatever way you prefer, one option is to click the "Code" button and opening it in a compatible editor.
2. Download and install [Python v3.12.3](https://www.python.org/downloads/release/python-3123/), this is the only version that we can guarantee our API will run on. Attempting to run another version of Python is not supported.
3. Download and install [PostgreSQL v16.2](https://www.postgresql.org/download/windows/).
4. Download and install [Flyway v10.7.1](https://flywaydb.org/download/thankyou?dl=https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline/10.7.1/flyway-commandline-10.7.1-windows-x64.zip).

After the repo and core programs have been installed, you are able to move onto setting up the rest of the project.

### 2. Setting up the API
Open a console window of your choice, windows; powershell; bash; etc. in the `crowd-emporium` folder and run the following commands:
1. ```bash
   python -m venv .venv
   ```
   This will create a virtual environment to install packages to.
2. ```bash
   .venv/Scripts/activate
   ```
   This will activate the virtual environment.
3. ```bash
   pip install -r ./src/requirements.txt
   ```
   This will install all requirements as they are listed in the `requirements.txt` file.

*Note that some terminals may instead require using backslashes (`\`) instead of forward slashes.

### 3. Setting up the Database
1. Download and install PostgreSQL.
2. Launch PSQL shell and run the following command:
   ```sql
   CREATE DATABASE crowd_emporium
   ```
3. Download and install Flyway.
   - Leave the folder you installed it to open, you will need the file path.
4. Create a file named `run_flyway.cmd` in the `flyway` folder and paste the following:
    ```bash
    @ECHO OFF
    set FLYWAY_HOME=C:\Path\to\your\flyway\folder

    @REM This command will allow parameters to be passed such as info or migrate
    %FLYWAY_HOME%\flyway.cmd -configFiles="./flyway/conf/flyway_postgresql.toml" %1 %2 %3 %4
    ```
   Make sure to replace `\Path\to\your\flyway\folder` with the full path to your installation of flyway.
   E.g. `C:\Programs\flyway-10.7.1`
5. Open a new terminal in the `crowd-emporium` folder if you closed the window from the previous steps.
6. Run `./flyway/run_flyway.cmd clean baseline migrate info`
   - This will remove any existing data, re-run all SQL files to generate the mock data, and then print a table showing the status of all operations.

### 4. Final steps
If every step has been followed correctly, running the `tools/run.bat` file will open the website and then launch the API.
If you receive an error saying the page does not exist, wait a moment and refresh the page.

If you are looking to contribute to the project, make sure to read the [style guide](./style-guide).
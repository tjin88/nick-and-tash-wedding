## Exporting new packages to requirements.txt
pip freeze > requirements.txt

### Mac:
cd python_server
python -m venv .venv_wedding (first time only) --> Requires python 3.10.x
source .venv_wedding/bin/activate
pip install -r requirements.txt
python send_invites_canada.py
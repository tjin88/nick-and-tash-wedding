## Exporting new packages to requirements.txt
pip3 freeze > requirements.txt

### Mac:
cd python_server
python -m venv .venv_wedding (first time only)
source .venv_wedding/bin/activate
pip3 install -r requirements.txt
python main.py
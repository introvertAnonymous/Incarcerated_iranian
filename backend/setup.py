from os.path import join

from setuptools import find_packages, setup
import os


here = os.path.dirname(__file__)


def get_version():
    version_file = join(here, "incarcerated_api", "__init__.py")
    with open(version_file, "r") as f:
        exec(compile(f.read(), version_file, "exec"))
    return locals()["__version__"]


with open(os.path.join(here, "../Readme.md")) as f:
    readme = f.read()

with open(os.path.join(here, "requirements.txt")) as fh:
    requirements = [l.strip() for l in fh]

setup(
    name="incarcerated_api",
    version=get_version(),
    description="",
    author="ananymous",
    packages=find_packages(),
    url="https://www.wikidata.org/wiki/Q115571674",
    classifiers=[],
    long_description=readme,
    setup_requires=[
        "setuptools>=18.0",
    ],
    install_requires=requirements,
)

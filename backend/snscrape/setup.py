import os.path
import setuptools
from setuptools import find_packages, setup


with open(os.path.join(os.path.dirname(__file__), "README.md")) as fp:
    readme = fp.read()


setuptools.setup(
    name="snscrape",
    description="A social networking service scraper",
    setup_requires=[
        "setuptools>=18.0",
    ],
    install_requires=[
        "requests[socks]",
        "lxml",
        "beautifulsoup4",
        'pytz; python_version < "3.9.0"',
        "filelock",
    ],
    packages=find_packages(),
)

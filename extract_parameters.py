#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr 23 08:08:27 2019

@author: caseybrittain
"""

# This script is meant to extract parameter keywords from:
# https://docs.looker.com/reference/field-reference

import requests
from bs4 import BeautifulSoup

html = requests.get('https://docs.looker.com/reference/field-reference').text

soup = BeautifulSoup(html, 'html')
parameters_col = soup.findAll('table')

for parameter in parameters_col:
    
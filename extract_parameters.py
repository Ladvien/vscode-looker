#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr 23 08:08:27 2019

@author: caseybrittain
"""

# This script is meant to extract parameter keywords from:
# https://docs.looker.com/reference/field-reference

import requests
import re
import json
from bs4 import BeautifulSoup

looker_vscode_build_path = '/Users/caseybrittain/looker/'

html = requests.get('https://docs.looker.com/reference/field-reference').text

soup = BeautifulSoup(html, 'lxml') # Parse the HTML as a string
table = soup.find_all('table')[0] # Grab the first table

lookml_parameters = dict()

for row in table.find_all('tr'):
    columns = row.find_all('td')
    # Make sure there are columns, but if there is only one, it's a header.
    if len(columns) > 0 and len(columns) > 1 and columns is not None:          
        target_text = columns[0].text
        # Remove newlines.
        target_text = target_text.replace('\n', '')
        # Remove inline annotation
        target_text = re.sub(r'\([^()]*\)', '', target_text)
        # Make sure only text remains
        target_text = target_text.strip()
        if 'dimension' != target_text and \
           'measure' != target_text and \
           'link' != target_text and \
           'filter' != target_text and \
           'dimension_group' != target_text and \
           'parameter' != target_text:               
               lookml_parameters[target_text] = (target_text)

lookml_parameters = list(lookml_parameters.keys())

parameters_string = ''

for item in lookml_parameters:
    parameters_string += item + '|'

#with open(looker_vscode_build_path + 'syntaxes/lookml.tmLanguage.json') as json_file:
#    data = json.load(json_file)
#    repo = data['repository']
"""
File: docs-to-md

Description:
Primary Author(s): Michael Clawar
Secondary Author(s):

Notes:

December 19, 2016
StratoDem Analytics, LLC
"""

import os
import json


CORE_DIR = 'docs/core'

DOC_DIRS = frozenset({
    CORE_DIR,
})


def docs_files(directory):
    return [(file_dir, files) for file_dir, _, files in os.walk(directory)
            if any('.json' in file for file in files)]


def document_series(series_json):
    series_json = [series_json[0]] + sorted(series_json[1:], key=lambda k: k['name'])
    with open('docs/core/series.md', 'w') as f:
        f.write('# Series\n\n')
        for obj in series_json:
            name = obj['name']

            if name == 'module.exports':
                f.write('## New `Series`\n\n'.format(name=name))
            elif name == 'exports':
                continue
            else:
                f.write('## `Series.{name}`\n\n'.format(name=name))

            if 'examples' in obj:
                examples = obj['examples']

                for example in examples:
                    f.write('```javascript\n{example}\n```\n\n'.format(example=example))

            if 'description' in obj:
                description = obj['description']
                f.write('{desc}\n\n'.format(desc=description))

            if 'params' in obj:
                params = obj['params']

                if len(params) == 0:
                    continue

                f.write('### Parameters\n\n')
                f.write('Name | Description | Default | Type(s)\n'
                        '-----|-------------|---------|--------\n')

                for param in params:
                    if 'name' in param:
                        param_name = param['name']
                    else:
                        param_name = ''

                    if 'description' in param:
                        param_description = param['description']
                    else:
                        param_description = ''

                    if 'defaultvalue' in param:
                        param_default = param['defaultvalue']
                    else:
                        param_default = None

                    if 'type' in param:
                        param_types = ', '.join(str(n) for n in param['type']['names'])
                    else:
                        param_types = None

                    f.write('{name} | {desc} | {default} | {types}\n'.format(name=param_name,
                                                                             desc=param_description,
                                                                             default=param_default,
                                                                             types=param_types))
                f.write('\n')

            if 'returns' in obj:
                return_value = obj['returns'][0]

                return_type = ', '.join(str(x) for x in return_value['type']['names'])

                f.write('### Returns {return_type}\n\n'.format(return_type=return_type))


def document_dataframe(dataframe_json):
    dataframe_json = [dataframe_json[0]] + sorted(dataframe_json[1:], key=lambda k: k['name'])
    with open('docs/core/frame.md', 'w') as f:
        f.write('# DataFrame\n\n')
        for obj in dataframe_json:
            name = obj['name']

            if name == 'module.exports':
                f.write('## New `DataFrame`\n\n'.format(name=name))
            elif name == 'exports':
                continue
            else:
                f.write('## `DataFrame.{name}`\n\n'.format(name=name))

            if 'examples' in obj:
                examples = obj['examples']

                for example in examples:
                    f.write('```javascript\n{example}\n```\n\n'.format(example=example))

            if 'description' in obj:
                description = obj['description']
                f.write('{desc}\n\n'.format(desc=description))

            if 'params' in obj:
                params = obj['params']

                if len(params) == 0:
                    continue

                f.write('### Parameters\n\n')
                f.write('Name | Description | Default | Type(s)\n'
                        '-----|-------------|---------|--------\n')

                for param in params:
                    if 'name' in param:
                        param_name = param['name']
                    else:
                        param_name = ''

                    if 'description' in param:
                        param_description = param['description']
                    else:
                        param_description = ''

                    if 'defaultvalue' in param:
                        param_default = param['defaultvalue']
                    else:
                        param_default = None

                    if 'type' in param:
                        param_types = ', '.join(str(n) for n in param['type']['names'])
                    else:
                        param_types = None

                    f.write('{name} | {desc} | {default} | {types}\n'.format(name=param_name,
                                                                             desc=param_description,
                                                                             default=param_default,
                                                                             types=param_types))
                f.write('\n')

            if 'returns' in obj:
                return_value = obj['returns'][0]

                return_type = ', '.join(str(x) for x in return_value['type']['names'])

                f.write('### Returns {return_type}\n\n'.format(return_type=return_type))


def main():
    while os.getcwd()[-8:] == '/scripts':
        os.chdir('..')

    for doc_dir in DOC_DIRS:
        for folder, files in docs_files(doc_dir):
            for file in [f for f in files if f[-5:] == '.json']:
                with open(os.path.join(folder, file), 'r') as f:
                    doc_json = json.load(f)

                    if file == 'series.json':
                        document_series(doc_json)
                    elif file == 'frame.json':
                        document_dataframe(doc_json)
                    else:
                        continue


if __name__ == '__main__':
    main()

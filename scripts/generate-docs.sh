#!/usr/bin/env bash

cd ..
mkdir docs

CORE_DIR=core

# Iterate over the directories
for rel_dir in ${CORE_DIR}
    do
    ES6_DIR=src/es6/${rel_dir%*/}
    DOC_DIR=docs/${rel_dir%*/}/
    echo "Generating docs into ${DOC_DIR}"
    mkdir ${DOC_DIR}

    for ES6_FILE in ${ES6_DIR}/*; do
        if [ -f ${ES6_FILE} ]
        then
            DOC_FILE_NAME=$(basename ${ES6_FILE})
            DOC_FILE_NAME="${DOC_FILE_NAME%%.*}"
            DOC_FILE_NAME=${DOC_FILE_NAME}.json

            jsdoc2md --json ${ES6_FILE} \
                > ${DOC_DIR}${DOC_FILE_NAME} 2> /dev/null
        fi
    done
done

python scripts/docs-to-md.py

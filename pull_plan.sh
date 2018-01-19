#!/bin/bash
curl http://www.studierendenwerk-koblenz.de/api/speiseplan/speiseplan.xml -o "$(pwd)/dist/speiseplan.xml"

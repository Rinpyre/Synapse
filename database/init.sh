#!/bin/bash
set -e

if ! /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1 FROM sys.databases WHERE name = 'DATASET1'" -h -1 | grep -q DATASET1; then
  echo "Running init scripts for Dataset 1..."
  for f in /usr/src/app/DATASET1/*.sql; do
    echo "-> $f"
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i "$f"
  done
else
  echo "Dataset 1 already exists, skipping init"
fi

if ! /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1 FROM sys.databases WHERE name = 'DATASET2'" -h -1 | grep -q DATASET2; then
  echo "Running init scripts for Dataset 2..."
  for f in /usr/src/app/DATASET2/*.sql; do
    echo "-> $f"
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i "$f"
  done
else
  echo "Dataset 2 already exists, skipping init"
fi

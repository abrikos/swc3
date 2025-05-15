#!/bin/bash
wget http://swc.qtech.ru/swc.tar.gz -O swc.tar.gz
tar -xvzf swc.tar.gz
mongorestore --drop
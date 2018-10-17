#!/usr/bin/python
# -*- coding: utf-8 -*-

import hashlib
import os

contrasena = input('Pass: ');

salt = hashlib.sha512(os.urandom(16)).hexdigest();

#contrasena = hashlib.sha512(contrasena.encode("utf-8")).hexdigest();

codigo = contrasena + salt;
codigo = hashlib.sha512(codigo.encode("utf-8")).hexdigest();

print('Salt: "'+salt+'"');
print('Code: "'+codigo+'"');

input();
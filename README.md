"# iipzy-tc"
"# iipzy-tc"

Encrypt the services directory before checkin.

1.  cd src

2.  tar the services directory: tar -cf services.tar services

3.  Encrypt the tar: ..\..\iipzy-encrypt\iipzy-encrypt.exe -e -in services.tar -out services.enc -p <secret>

4.  Delete the tar file.

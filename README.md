"# iipzy-tc"
"# iipzy-tc"

Encrypt the services directory before checkin.

1.  cd iipzy-tc

2.  tar the src directory: tar -cvzf src.tar.gz src

3.  Encrypt the tar: ..\iipzy-encrypt\iipzy-encrypt.exe -e -in src.tar.gz -out src.sec -p <secret>

4.  Delete the tar file: rem

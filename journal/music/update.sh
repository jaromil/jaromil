#!/bin/sh


echo "*** Rendering BEAT"
# render flac
timidity -OF BEAT.xm
# encode ogg
oggenc -q5 -o BEAT.ogg \
    -d 1998 -t "BEAT" -a "Jaromil" -G "funky" \
    -c "copyright=Copyleft 1998 Denis Jaromil Roio" \
    -c "license=Open Audio License (OAL)" \
    BEAT.flac
#make partiture
midi2ly BEAT.mid
convert-ly BEAT-midi.ly > BEAT.ly
lilypond BEAT.ly
rm -f BEAT.ps BEAT-midi.ly BEAT.ly

echo "*** Rendering Korova"
# render flac
timidity -OF korova.mid
# encode ogg
oggenc -q5 -o korova.ogg \
    -d 1999 -t "Korova nicest dreams" -a "Jaromil" -G "smooth jazz" \
    -c "copyright=Copyleft 1999 Denis Jaromil Roio" \
    -c "license=Open Audio License (OAL)" \
    korova.flac
# make partiture
midi2ly korova.mid
convert-ly korova-midi.ly > korova.ly
lilypond korova.ly
rm -f korova.ps korova-midi.ly korova.ly


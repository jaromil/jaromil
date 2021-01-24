

<!-- vvvvvvvvvvvvvvvvvvvvvvvvvvvv FOOTER vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv -->

<!--
Copyright (C) 2000-2005 dyne.org autoproduzioni

Permission is granted to copy, distribute and/or modify this document
under the terms of the GNU Free Documentation License, Version 1.1
or any later version published by the Free Software Foundation;
with the Invariant Sections being AUTHORS when present and this copyright
notice.
A copy of the license is included in the section entitled "GNU Free
Documentation License" at http://fsf.org/licenses/licenses.html
-->

<hr>

<table align="center" id="footer" cellspacing="10">
<tr align="center">

{if $counter}
{$counter}
{else}

<td>
<!-- CLUSTER MAPS -->
<a href="http://clustrmaps.com/counter/maps.php?url=http://dyne.org" id="clustrMapsLink"><img src="http://clustrmaps.com/counter/index2.php?url=http://dyne.org" border=1 alt="Locations of visitors to this page"onError="this.onError=null; this.src='http://www.meetomatic.com/images/clustrmaps-back-soon.jpg'; document.getElementById('clustrMapsLink').href='http://clustrmaps.com/'">
</a>
</td>

{/if}

<td>

{if $license=="gpl"}
<!-- Creative Commons License -->
<a href="http://creativecommons.org/licenses/GPL/2.0/">
<img alt="CC-GNU GPL" border="0" src="http://creativecommons.org/images/public/cc-GPL-a.png"
     title="we produce 100% free software!" hspace="0" /></a>
<!-- /Creative Commons License -->
<!--
<rdf:RDF xmlns="http://web.resource.org/cc/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<Work rdf:about="">
   <license rdf:resource="http://creativecommons.org/licenses/GPL/2.0/" />
   <dc:type rdf:resource="http://purl.org/dc/dcmitype/Software" />
</Work>
<License rdf:about="http://creativecommons.org/licenses/GPL/2.0/">
   <permits rdf:resource="http://web.resource.org/cc/Reproduction" />
   <permits rdf:resource="http://web.resource.org/cc/Distribution" />
   <requires rdf:resource="http://web.resource.org/cc/Notice" />
   <permits rdf:resource="http://web.resource.org/cc/DerivativeWorks" />
   <requires rdf:resource="http://web.resource.org/cc/ShareAlike" />
   <requires rdf:resource="http://web.resource.org/cc/SourceCode" />
</License>
</rdf:RDF>
-->
{else}


<!-- Creative Commons License -->
<a rel="license" href="http://creativecommons.org/licenses/by-sa/2.0/">
<img alt="Creative Commons License" border="0" src="http://creativecommons.org/images/public/somerights20.gif" /></a>
<!-- /Creative Commons License -->

<!--
<rdf:RDF xmlns="http://web.resource.org/cc/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<Work rdf:about="">
   <license rdf:resource="http://creativecommons.org/licenses/by-sa/2.0/" />
</Work>

<License rdf:about="http://creativecommons.org/licenses/by-sa/2.0/">
   <permits rdf:resource="http://web.resource.org/cc/Reproduction" />
   <permits rdf:resource="http://web.resource.org/cc/Distribution" />
   <requires rdf:resource="http://web.resource.org/cc/Notice" />
   <requires rdf:resource="http://web.resource.org/cc/Attribution" />
   <permits rdf:resource="http://web.resource.org/cc/DerivativeWorks" />
   <requires rdf:resource="http://web.resource.org/cc/ShareAlike" />
</License>

</rdf:RDF>
-->
{/if}

</td><td>

<!--
<table>
{if $gen_time}
<tr><td colspan="2" align="center"><font size="-2">page generated in {$gen_time} secs</font></td></tr>
{/if}
<tr><td>
<a href="http://validator.w3.org/check/referer"><img border="0" src="http://dyne.org/pics/valid-html401.png" alt="Valid HTML 4.01!" height="31" width="88" hspace="0"></a>
</td>
<td>
<a HREF="http://www.anybrowser.org/campaign/"><img src="http://dyne.org/pics/content_enhanced.png" width="96" height="32" BORDER=0 ALT="Use Any Browser" title="Content Enhanced - Use Any Browser" hspace="10"></a>
</td></tr>
</table>
-->
</td>

<td width="80">

<a href="http://www.gnu.org"><img border="0" src="http://dyne.org/pics/gnu.png" alt="GNU/Linux" height="65" width="75"></a>

</td>

<td>
<p> <a href="http://www.nosoftwarepatents.com">
<img src="http://dyne.org/pics/nswpat.gif" alt="no software patents" title="freedom of creation!">
</a> </p>


<p> <a href="http://www.defectivebydesign.org/join/button">
<img src="http://tbith.dyne.org/nodrm.gif" alt="say no to DRM" title="digital rights now!">
</a> </p>

</td>

<td align="right">


<font size="-2">

{if $author} Copyleft (C) {$author}.
{else} Copyleft (C) 2000 - 2007 dyne.org foundation. {/if}
Verbatim copying and distribution of this entire page is permitted in any medium, provided this notice is preserved.
<a href="http://dyne.org/hackers_contact.php">
Send inquiries &amp; questions to dyne.org's hackers</a>.
</font>

</td><td>

<a href="http://dyne.org">
<img src="http://dyne.org/dyne-sm.png" hspace="5" align="right" border="0" alt="|"></a>

</td>
</tr></table>


</body>
</html>

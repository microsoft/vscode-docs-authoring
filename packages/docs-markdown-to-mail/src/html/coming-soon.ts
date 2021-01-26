export async function generateHtml(emailBodyContent: string, title: string) {
   return `
   <HTML xmlns="http://www.w3.org/TR/REC-html40" xmlns:v = "urn:schemas-microsoft-com:vml" xmlns:o = "urn:schemas-microsoft-com:office:office" xmlns:w = "urn:schemas-microsoft-com:office:word" xmlns:dt = "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" xmlns:m = "http://schemas.microsoft.com/office/2004/12/omml">
      <HEAD>
         <META content="text/html; charset=Windows-1252" http-equiv=Content-Type>
         <META name=Generator content="Microsoft Word 15 (filtered medium)">
         <STYLE>v\:* {
            BEHAVIOR: url(#default#VML)
            }
            o\:* {
            BEHAVIOR: url(#default#VML)
            }
            w\:* {
            BEHAVIOR: url(#default#VML)
            }
            .shape {
            BEHAVIOR: url(#default#VML)
            }
         </STYLE>
         <STYLE>@font-face {
            font-family: Cambria Math;
            }
            @font-face {
            font-family: 等线;
            }
            @font-face {
            font-family: Calibri;
            }
            @font-face {
            font-family: Segoe UI;
            }
            @font-face {
            font-family: Segoe UI Semibold;
            }
            @font-face {
            font-family: @等线;
            }
            @page WordSection1 {size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in; }
            P.MsoNormal {
            FONT-SIZE: 11pt; FONT-FAMILY: "Calibri",sans-serif; MARGIN: 0in
            }
            LI.MsoNormal {
            FONT-SIZE: 11pt; FONT-FAMILY: "Calibri",sans-serif; MARGIN: 0in
            }
            DIV.MsoNormal {
            FONT-SIZE: 11pt; FONT-FAMILY: "Calibri",sans-serif; MARGIN: 0in
            }
            A:link {
            TEXT-DECORATION: underline; COLOR: #0563c1; mso-style-priority: 99
            }
            SPAN.MsoHyperlink {
            TEXT-DECORATION: underline; COLOR: #0563c1; mso-style-priority: 99
            }
            SPAN.apple-converted-space {
            mso-style-name: apple-converted-space
            }
            SPAN.EmailStyle22 {
            FONT-FAMILY: "Calibri",sans-serif; COLOR: windowtext; mso-style-type: personal-compose
            }
            .MsoChpDefault {
            FONT-SIZE: 10pt; mso-style-type: export-only
            }
            DIV.WordSection1 {
            page: WordSection1
            }
         </STYLE>
      </HEAD>
      <BODY lang=EN-US style="WORD-WRAP: break-word" vLink=#954f72 link=#0563c1>
         <DIV class=WordSection1>
            <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: #f2f2f2; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 width="100%" border=0>
               <TBODY>
                  <TR>
                     <TD style="PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top>
                        <DIV align=center>
                           <TABLE class=MsoNormalTable style="BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 border=0>
                              <TBODY>
                                 <TR>
                                    <TD style="WIDTH: 1pt; BACKGROUND: #f1f3f5; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" width=1>
                                       <TABLE class=MsoNormalTable style="WIDTH: 5.4in; BACKGROUND: white; MARGIN-LEFT: -2.25pt; MARGIN-RIGHT: -2.25pt" cellSpacing=0 cellPadding=0 width=518 align=right border=0>
                                          <TBODY>
                                             <TR>
                                                <TD style="WIDTH: 5.4in; BACKGROUND: #f1f3f5; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 7.5pt" width=518>
                                                   <P style="TEXT-ALIGN: right; MARGIN: 0in" align=right>
                                                      <SPAN style='FONT-SIZE: 10.5pt; FONT-FAMILY: "Segoe UI Semibold",sans-serif; COLOR: #505050'>January 2021</SPAN>
                                                      <SPAN style='FONT-SIZE: 10.5pt; FONT-FAMILY: "Times New Roman",serif'>
                                                         <o:p></o:p>
                                                      </SPAN>
                                                   </P>
                                                   <P style="TEXT-ALIGN: right; MARGIN: 0in; LINE-HEIGHT: 1.5pt" align=right>
                                                      <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #334050'>&nbsp;</SPAN>
                                                      <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Times New Roman",serif'>
                                                         <o:p></o:p>
                                                      </SPAN>
                                                   </P>
                                                </TD>
                                             </TR>
                                          </TBODY>
                                       </TABLE>
                                    </TD>
                                 </TR>
                                 <TR>
                                    <TD style="WIDTH: 1pt; BACKGROUND: #f1f3f5; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=1>
                                       <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: white" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                          <TBODY>
                                             <TR>
                                                <TD style="WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                                   <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: #00188f" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                                      <TBODY>
                                                         <TR>
                                                            <TD style="WIDTH: 480pt; BACKGROUND: white; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                                               <P class=MsoNormal style="mso-line-height-alt: 0pt">
                                                                  <SPAN style='FONT-FAMILY: "Segoe UI",sans-serif; COLOR: black'><IMG id=Picture style="HEIGHT: 1.25in; WIDTH: 6.677in" alt="Developer Relations Content and Learning Coming Soon" src="cid:coming-soon.png" width=641 height=120></SPAN>
                                                                  <SPAN style='FONT-FAMILY: "Segoe UI",sans-serif'>
                                                                     <o:p></o:p>
                                                                  </SPAN>
                                                               </P>
                                                            </TD>
                                                         </TR>
                                                      </TBODY>
                                                   </TABLE>
                                                </TD>
                                             </TR>
                                          </TBODY>
                                       </TABLE>
                                    </TD>
                                 </TR>
                              </TBODY>
                           </TABLE>
                        </DIV>
                     </TD>
                  </TR>
                  <TR style="HEIGHT: 3.8pt">
                     <TD style="HEIGHT: 3.8pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top>
                        <DIV align=center>
                           <TABLE class=MsoNormalTable style="BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 border=0>
                              <TBODY>
                                 <TR>
                                    <TD style="WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                       <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: white" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                          <TBODY>
                                             <TR style="HEIGHT: 7.5pt">
                                                <TD style="HEIGHT: 7.5pt; WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 3.75pt; PADDING-RIGHT: 3.75pt" vAlign=top width=640>
                                                   <P class=MsoNormal style="LINE-HEIGHT: 1pt">
                                                      <SPAN style="FONT-SIZE: 1pt; COLOR: black">&nbsp;<SPAN class=apple-converted-space>&nbsp;</SPAN></SPAN>
                                                      <o:p></o:p>
                                                   </P>
                                                </TD>
                                             </TR>
                                          </TBODY>
                                       </TABLE>
                                    </TD>
                                 </TR>
                              </TBODY>
                           </TABLE>
                        </DIV>
                     </TD>
                  </TR>
                  <TR>
                     <TD style="PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top></TD>
                  </TR>
                  <TR>
                     <TD style="PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top>
                        <DIV align=center>
                           <TABLE class=MsoNormalTable style="BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 border=0>
                              <TBODY>
                                 <TR style="HEIGHT: 0.1in">
                                    <TD style="HEIGHT: 0.1in; WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                       <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                          <TBODY>
                                             <TR style="HEIGHT: 984.9pt">
                                                <TD style="HEIGHT: 984.9pt; PADDING-BOTTOM: 0.25in; PADDING-TOP: 15pt; PADDING-LEFT: 0.25in; PADDING-RIGHT: 0.25in" vAlign=top>
                                                   <P>
                                                      <SPAN style='FONT-SIZE: 12pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #2f2f2f'>
                                                         ${emailBodyContent}
                                                         <o:p></o:p>
                                                      </SPAN>
                                                   </P>
                                                   <P>
                                                      <SPAN class=apple-converted-space>
                                                         <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Times New Roman",serif'>
                                                            <o:p></o:p>
                                                         </SPAN>
                                                      </SPAN>
                                                   </P>
                                                   <P style="MARGIN-BOTTOM: 12pt">
                                                      <SPAN class=apple-converted-space>
                                                         <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #2f2f2f'>
                                                            <o:p></o:p>
                                                         </SPAN>
                                                      </SPAN>
                                                   </P>
                                                </TD>
                                             </TR>
                                          </TBODY>
                                       </TABLE>
                                    </TD>
                                 </TR>
                                 <TR>
                                    <TD style="PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top>
                                       <DIV align=center>
                                          <TABLE class=MsoNormalTable style="BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 border=0>
                                             <TBODY>
                                                <TR>
                                                   <TD style="WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0.25in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                                      <TABLE class=MsoNormalTable style="BACKGROUND: white; BORDER-COLLAPSE: collapse; MARGIN-LEFT: 6.75pt; MARGIN-RIGHT: 6.75pt" cellSpacing=0 cellPadding=0 align=left border=0>
                                                         <TBODY>
                                                            <TR>
                                                               <TD style="WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                                                  <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: white" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                                                     <TBODY>
                                                                        <TR>
                                                                           <TD style="WIDTH: 480pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width=640>
                                                                              <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                                 <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Times New Roman",serif; COLOR: black'>&nbsp;</SPAN>
                                                                                 <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Times New Roman",serif'>
                                                                                    <o:p></o:p>
                                                                                 </SPAN>
                                                                              </P>
                                                                           </TD>
                                                                        </TR>
                                                                     </TBODY>
                                                                  </TABLE>
                                                               </TD>
                                                            </TR>
                                                         </TBODY>
                                                      </TABLE>
                                                      <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                         <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Times New Roman",serif; COLOR: black'>&nbsp;</SPAN>
                                                         <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Times New Roman",serif'>
                                                            <o:p></o:p>
                                                         </SPAN>
                                                      </P>
                                                      <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: white; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                                         <TBODY>
                                                            <TR style="HEIGHT: 24.9pt">
                                                               <TD style="HEIGHT: 24.9pt; WIDTH: 100%; PADDING-BOTTOM: 0in; PADDING-TOP: 7.5pt; PADDING-LEFT: 0.25in; PADDING-RIGHT: 0.25in" vAlign=top width="100%">
                                                                  <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                     <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #454545'>
                                                                        &nbsp;&nbsp;
                                                                        <o:p></o:p>
                                                                     </SPAN>
                                                                  </P>
                                                                  <TABLE class=MsoNormalTable style="MARGIN-LEFT: -2.25pt; MARGIN-RIGHT: -2.25pt" cellSpacing=0 cellPadding=0 align=left border=0>
                                                                     <TBODY>
                                                                        <TR>
                                                                           <TD style="WIDTH: 100%; PADDING-BOTTOM: 7.5pt; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" vAlign=top width="100%">
                                                                              <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                                 <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Times New Roman",serif'>
                                                                                    &nbsp;
                                                                                    <o:p></o:p>
                                                                                 </SPAN>
                                                                              </P>
                                                                              <TABLE class=MsoNormalTable style="WIDTH: 142.5pt; BACKGROUND: white; MARGIN-LEFT: -2.25pt; MARGIN-RIGHT: -2.25pt" cellSpacing=0 cellPadding=0 width=190 align=left border=0>
                                                                                 <TBODY>
                                                                                    <TR>
                                                                                       <TD style="WIDTH: 33.75pt; PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 0in" width=45>
                                                                                          <P style="MARGIN: 0in">
                                                                                             <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #334050'>
                                                                                                <o:p></o:p>
                                                                                             </SPAN>
                                                                                          </P>
                                                                                       </TD>
                                                                                       <TD style="PADDING-BOTTOM: 0in; PADDING-TOP: 0in; PADDING-LEFT: 0in; PADDING-RIGHT: 7.5pt">
                                                                                          <P style="MARGIN: 0in">
                                                                                             <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #334050'>
                                                                                                <o:p></o:p>
                                                                                             </SPAN>
                                                                                          </P>
                                                                                          <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                                             <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #334050'>
                                                                                                &nbsp;
                                                                                                <o:p></o:p>
                                                                                             </SPAN>
                                                                                          </P>
                                                                                       </TD>
                                                                                    </TR>
                                                                                 </TBODY>
                                                                              </TABLE>
                                                                              <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                                 <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Times New Roman",serif'>
                                                                                    &nbsp;
                                                                                    <o:p></o:p>
                                                                                 </SPAN>
                                                                              </P>
                                                                              <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                                 <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Times New Roman",serif'>
                                                                                    &nbsp;
                                                                                    <o:p></o:p>
                                                                                 </SPAN>
                                                                              </P>
                                                                           </TD>
                                                                        </TR>
                                                                     </TBODY>
                                                                  </TABLE>
                                                                  <P style="MARGIN: 0in; LINE-HEIGHT: 1.5pt">
                                                                     <SPAN style='FONT-SIZE: 1.5pt; FONT-FAMILY: "Segoe UI",sans-serif; COLOR: #454545'>
                                                                        &nbsp;
                                                                        <o:p></o:p>
                                                                     </SPAN>
                                                                  </P>
                                                               </TD>
                                                            </TR>
                                                         </TBODY>
                                                      </TABLE>
                                                      <P style="MARGIN: 0in; mso-line-height-alt: 1.5pt">
                                                         <SPAN style='FONT-SIZE: 10pt; FONT-FAMILY: "Times New Roman",serif'>
                                                            <o:p>&nbsp;</o:p>
                                                         </SPAN>
                                                      </P>
                                                      <TABLE class=MsoNormalTable style="WIDTH: 100%; BACKGROUND: #f2f2f2; BORDER-COLLAPSE: collapse" cellSpacing=0 cellPadding=0 width="100%" border=0>
                                                         <TBODY>
                                                            <TR>
                                                               <TD style="WIDTH: 100%; PADDING-BOTTOM: 0.25in; PADDING-TOP: 0.25in; PADDING-LEFT: 0.25in; PADDING-RIGHT: 0.25in" vAlign=top width="100%">
                                                                  <P class=MsoNormal>
                                                                     <span style="font-size:11.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;color:black"><img border="0" width="90" height="19" style="width:.9375in;height:.1979in" id="Picture_x0020_3" src="cid:microsoft-logo.png" alt="Microsoft logo"></span>
                                                                     <o:p></o:p>
                                                                  </P>
                                                               </TD>
                                                            </TR>
                                                         </TBODY>
                                                      </TABLE>
                                                      <P class=MsoNormal>
                                                         <o:p></o:p>
                                                      </P>
                                                   </TD>
                                                </TR>
                                             </TBODY>
                                          </TABLE>
                                       </DIV>
                                    </TD>
                                 </TR>
                              </TBODY>
                           </TABLE>
                        </DIV>
                     </TD>
                  </TR>
               </TBODY>
            </TABLE>
            <P class=MsoNormal>
               <o:p>&nbsp;</o:p>
            </P>
         </DIV>
      </BODY>
   </HTML>
   `;
}
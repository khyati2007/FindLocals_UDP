from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
from pathlib import Path
from html import escape

OUT=Path(r'C:\Users\ASUS\Documents\FIndlocals_UDP\FindLocals_Diagrams.drawio')
mxfile=Element('mxfile',{'host':'app.diagrams.net','modified':'2026-10-30T00:00:00.000Z','agent':'Codex','version':'24.7.17','type':'device'})

def page(name,pid,width,height):
 d=SubElement(mxfile,'diagram',{'id':pid,'name':name}); model=SubElement(d,'mxGraphModel',{'dx':'1400','dy':'900','grid':'1','gridSize':'10','guides':'1','tooltips':'1','connect':'1','arrows':'1','fold':'1','page':'1','pageScale':'1','pageWidth':str(width),'pageHeight':str(height),'math':'0','shadow':'0'}); root=SubElement(model,'root'); SubElement(root,'mxCell',{'id':'0'}); SubElement(root,'mxCell',{'id':'1','parent':'0'}); return root

def vertex(root,id,value,style,x,y,w,h):
 c=SubElement(root,'mxCell',{'id':id,'value':value,'style':style,'vertex':'1','parent':'1'});SubElement(c,'mxGeometry',{'x':str(x),'y':str(y),'width':str(w),'height':str(h),'as':'geometry'});return c

def edge(root,id,source,target,label='',style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=#526579;fontSize=12;'):
 attrs={'id':id,'value':label,'style':style,'edge':'1','parent':'1','source':source,'target':target};c=SubElement(root,'mxCell',attrs);SubElement(c,'mxGeometry',{'relative':'1','as':'geometry'});return c

# PAGE 1: Class diagram
r=page('Class Diagram','class-diagram',1500,940)
blue='#193B61'; teal='#168A9A'; dark='#334155'; pale='#F5F8FC'
class_style=f'rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor={blue};fontColor=#102A43;fontSize=14;align=left;verticalAlign=top;spacingLeft=10;spacingTop=8;strokeWidth=1.5;'
classes={
 'User':(470,90,380,115,['+ userId: int','+ name: string','+ email: string','+ phone: string','+ role: string'],['+ register()','+ login()']),
 'Admin':(70,410,280,125,['+ adminId: int'],['+ verifyWorker()','+ manageUsers()']),
 'Notification':(390,410,300,125,['+ notificationId: int','+ message: string','+ isRead: boolean'],[]),
 'Customer':(480,270,370,130,['+ address: string','+ preferredLanguage: string'],['+ searchWorkers()','+ createBooking()','+ submitReview()']),
 'Worker':(930,270,440,150,['+ serviceArea: string','+ skills: string[]','+ experience: int','+ availability: string','+ verified: boolean'],['+ manageProfile()','+ respondToBooking()']),
 'ServiceCategory':(1020,80,360,110,['+ categoryId: int','+ name: string','+ active: boolean'],[]),
 'Booking':(550,540,500,130,['+ bookingId: int','+ scheduledAt: datetime','+ address: string','+ status: string'],['+ create()','+ updateStatus()']),
 'Payment':(320,760,360,120,['+ paymentId: int','+ amount: decimal','+ method: string','+ status: string'],[]),
 'Review':(850,760,420,120,['+ reviewId: int','+ rating: int','+ comment: string','+ createdAt: datetime'],[]),
}
for name,(x,y,w,h,attrs,ops) in classes.items():
 lines=[f'<b>{name}</b>','<hr/>']+[escape(x) for x in attrs]
 if ops: lines+=['<hr/>']+[escape(x) for x in ops]
 vertex(r,name,'<div style="line-height:1.4">'+'<br>'.join(lines)+'</div>',class_style,x,y,w,h)
# relationships
edge(r,'e1','User','Admin','role')
edge(r,'e2','User','Customer','role')
edge(r,'e3','User','Worker','role')
edge(r,'e4','User','Notification','1 receives 0..*')
edge(r,'e5','Admin','Notification','manages',f'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=open;endFill=0;strokeColor={dark};fontSize=11;')
edge(r,'e6','Customer','Booking','1 creates 0..*')
edge(r,'e7','Worker','Booking','1 receives 0..*')
edge(r,'e8','ServiceCategory','Worker','1 category / many workers')
edge(r,'e9','ServiceCategory','Booking','1 category / many bookings')
edge(r,'e10','Booking','Payment','1 has 0..*')
edge(r,'e11','Booking','Review','0..1 review')
# add page subtitle
vertex(r,'title','FindLocals - Class Diagram','text;html=1;align=center;verticalAlign=middle;fontSize=24;fontStyle=1;fontColor=#193B61;',430,20,500,45)

# PAGE 2: Sequence Diagram
r=page('Service Booking Sequence','booking-sequence',1500,1080)
# title
vertex(r,'title2','FindLocals - Sequence Diagram: Service Booking','text;html=1;align=center;verticalAlign=middle;fontSize=24;fontStyle=1;fontColor=#193B61;',340,20,820,45)
# actors/lifelines
actors=[('customer','Customer',100,150,180),('app','FindLocals Web App',400,120,230),('db','Database',800,155,180),('worker','Worker',1190,155,180)]
for id,label,x,w,top in actors:
 vertex(r,id,label,f'rounded=1;arcSize=20;whiteSpace=wrap;html=1;fillColor=#F4F8FC;strokeColor={blue};fontColor=#102A43;fontSize=15;fontStyle=1;strokeWidth=2;',x,top,w,65)
 # dashed lifeline using line shape with dashed style
 vertex(r,id+'life','',f'shape=line;html=1;strokeColor=#718096;dashed=1;dashPattern=6 6;strokeWidth=1.5;',x+w/2,top+65,1,740)
# message arrows, call and return styles
call=f'edgeStyle=none;html=1;rounded=0;endArrow=block;endFill=1;strokeColor={blue};fontColor=#243B53;fontSize=12;labelBackgroundColor=#FFFFFF;'
ret=f'edgeStyle=none;html=1;rounded=0;endArrow=open;endFill=0;dashed=1;dashPattern=6 4;strokeColor=#526579;fontColor=#243B53;fontSize=12;labelBackgroundColor=#FFFFFF;'
# use direct edges attached to invisible y-level anchors for horizontal messages
# anchor vertices are points on lifelines; direct edges ensure crisp arrows
coords={'customer':190,'app':515,'db':890,'worker':1280}
def point(root,id,x,y):
 c=SubElement(root,'mxCell',{'id':id,'value':'','style':'shape=ellipse;perimeter=ellipsePerimeter;fillColor=none;strokeColor=none;opacity=0;','vertex':'1','parent':'1'});SubElement(c,'mxGeometry',{'x':str(x-2),'y':str(y-2),'width':'4','height':'4','as':'geometry'})
def msg(id,src,dst,y,label,style=call):
 point(r,id+'s',coords[src],y);point(r,id+'t',coords[dst],y);edge(r,id,id+'s',id+'t',label,style)
# alternating request/response path
msg('m1','customer','app',270,'1. Search workers by service and location')
msg('m2','app','db',330,'2. Query matching worker profiles')
msg('m3','db','app',390,'3. Return worker results',ret)
msg('m4','app','customer',450,'4. Display workers, ratings and profile details',ret)
msg('m5','customer','app',510,'5. Select worker and submit booking request')
msg('m6','app','db',570,'6. Save booking with pending status')
msg('m7','db','app',630,'7. Return booking confirmation',ret)
msg('m8','app','worker',690,'8. Notify worker of new request')
msg('m9','worker','app',750,'9. Accept or decline request')
msg('m10','app','db',810,'10. Update booking status')
msg('m11','db','app',870,'11. Confirm status update',ret)
msg('m12','app','customer',930,'12. Notify customer of worker response',ret)
msg('m13','worker','app',990,'13. Update job status after service',ret)
msg('m14','app','db',1035,'14. Store completion and payment status')
# note
vertex(r,'note','Booking requires customer sign-in. Payment status records cash collection; no online gateway is connected.','shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFF8E7;strokeColor=#C58B2B;fontColor=#4A3B22;fontSize=12;size=18;',500,900,310,85)
# xml save
raw=tostring(mxfile,encoding='utf-8')
pretty=minidom.parseString(raw).toprettyxml(indent='  ',encoding='utf-8')
OUT.write_bytes(pretty)
print(OUT)

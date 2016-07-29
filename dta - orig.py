file = open("candat - Copy.dat", "rb")
data_1= open("canbinary.txt",'w')
#data = file.readlines()
#print '\n'.join(data)
#print data
#print data[0]
data = ''
i=0
while 1:
	try:
		data+= '{0:08b}'.format(ord(file.read(1)))
		i+=1
		if i%16==0:
			data+='\n'
	except:
		print data
		data_1.write(data)
		break
		
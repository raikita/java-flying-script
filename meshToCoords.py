import bpy

def parse(vector):
    string = str(vector)
    string = string.replace("<", "")
    string = string.replace(">", "")
    string = string.replace("Vector", "")
    string = string.replace("(", "")
    string = string.replace(")", "")
    string = string.replace(",", "")
    
    splitString = string.split(" ")
    sx = splitString[1]
    sy = splitString[2]
    sz = splitString[3]
    x = int(float(sx)*100)
    y = int(float(sy)*100)
    z = int(float(sz)*100)
    
    coords = [x, y]
    
    return coords


print("writing...")
f = open("/home/rukiya/eclipse-workspace/flyingGame/level0.txt", "w")
for item in bpy.data.objects:
    if item.type == 'MESH' and item.name == 'level':
        for face in item.data.polygons:
            for vertex in face.vertices:
                coords = parse(item.data.vertices[vertex].co)
                f.write(str(coords[0]) + " " + str(coords[1]) + "\n")
f.close()
print("write done")                
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
    x = int(float(sx)*81.92)    # multiply by level's width/100!
    y = int(float(sy)*81.92)    # multiply by level's width/100!
    
    coords = [x, y]
    
    return coords

# run script in object mode!
print("writing...")
f = open("/home/rukiya/eclipse-workspace/flyingGame/level1-gold.txt", "w")
for item in bpy.data.objects:
    if item.type == 'MESH' and item.name == 'goldPlacement':
        for index, face in enumerate(item.data.polygons):
            for vertex in face.vertices:
                coords = parse(item.data.vertices[vertex].co)
                f.write(str(coords[0]) + " " + str(coords[1]) + "\n")
f.close()
print("write done")                
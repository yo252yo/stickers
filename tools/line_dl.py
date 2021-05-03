import StringIO
import shutil
from http_request_randomizer.requests.proxy.requestProxy import RequestProxy
import multiprocessing
import os.path
import logging
import random

logging.getLogger("RequestProxy").setLevel(logging.CRITICAL)

#img_url = 'https://stickershop.line-scdn.net/stickershop/v1/sticker/{id}/android/sticker.png'
img_url = 'https://stickershop.line-scdn.net/stickershop/v1/sticker/{id}/android/sticker_animation@2x.png'

filename = "files/{id}.png"
notfilename = "notfiles/{id}.png"


print ("initializing.....")

list_exist = set(os.listdir("files/"))
#  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! WE NEED TO INTEGRATE SUBFOLDERS
list_notexist = set(os.listdir("notfiles/"))

target_from = 24000000
target_to = 28000000
steps = 500000
nb_threads = 150

def mb_print(string):
    #if random.random() > 0.9:
    print string

def list_append(index, range_ids):

    req_proxy = RequestProxy(sustain=False)
    RequestProxy.set_logger_level(req_proxy, "CRITICAL")
   
    print ("[{i}] <<<<<<<<<<<<< READY LETS GO GO GO ".format(i=index))
    progress = 0
    for current_id in range_ids:
        progress = progress + 1
        picname="{id}.png".format(id=current_id)
        if picname in list_exist or picname in list_notexist:
            continue
        try:
            progress_percent = int(1000 * progress / len(range_ids))/10
            mb_print("[{i}]=============== ID={id}, ({p}%)".format(id=current_id, i=index, p=progress_percent))
            request = req_proxy.generate_proxied_request(img_url.format(id=current_id))
            if request.status_code == 200:
                buffer = StringIO.StringIO(request.content)    
                file = open(filename.format(id=current_id), "wb")
                shutil.copyfileobj(buffer,file)
                file.close()
            else:
                file = open(notfilename.format(id=current_id), "wb")
                file.close()
            if random.random() > 0.9995:
                req_proxy = RequestProxy(sustain=False)
        except Exception:
            i = 1
            mb_print("[{i}]XXXXXXXX ID={id}".format(id=current_id, i=index))

    print ("[{i}] >>>>>>>>>>>>> OVER ".format(i=index))
            

   
def dojobs(tfrom, tto):         
    jobs = []

    ids = []
    for i in range(tfrom, tto):
        picname="{id}.png".format(id=i)
        if not (picname in list_exist or picname in list_notexist):
            ids.append(i)

    pics_by_thread = 1 + int(len(ids) / nb_threads)
    thread_capacity_pics_per_min = 40
    time_est_min = pics_by_thread / thread_capacity_pics_per_min
    print(">>>>>>>>>>>>> STARTING TARGET FROM {target_from} TO {target_to}, actually {files} files".format(target_from=tfrom, target_to=tto, files=len(ids)))
    print(">>>>>>>>>>>>> FOR {thread} THREADS, {pics} pics/thread".format(thread=nb_threads, pics=pics_by_thread))
    print(">>>>>>>>>>>>> ESTIMATED TIME {mins} mins".format(mins=time_est_min))
    
    for i in range(0, nb_threads):
        range_ids = ids[i*pics_by_thread:(i+1)*pics_by_thread]
        if len(range_ids) > 0:
            print (">>>>>>>>>>>>> THREAD FROM {fid} TO {tid}".format(fid=range_ids[0], tid=range_ids[len(range_ids)-1]))
        thread = multiprocessing.Process(target=list_append, args=(i, range_ids))
        jobs.append(thread)

    for j in jobs:
        j.start()

    for j in jobs:
        j.join()
    print("DONE FROM {fromid} TO {toid} ({pics} new pics)".format(fromid=tfrom, toid=tto, pics=len(ids)))


if __name__ == "__main__":
    tfrom = target_from
    while tfrom < target_to:
        dojobs(tfrom, tfrom + steps)
        tfrom = tfrom + steps

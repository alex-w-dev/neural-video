import os
import uuid
from PIL import Image
from flask import Flask, send_file, request
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
import random
import torch
import gc
import numpy as np
import time

app = Flask(__name__)
api = Api(app)
CORS(app)

print('Import  kandinsky2 library...')
from kandinsky2 import get_kandinsky2

def torch_gc():
   with torch.cuda.device("cuda"):
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()

def add_margin(pil_img, top, right, bottom, left, color):
    width, height = pil_img.size
    new_width = width + right + left
    new_height = height + top + bottom
    result = Image.new(pil_img.mode, (new_width, new_height), color)
    result.paste(pil_img, (left, top))
    return result

torch_gc()
torch.cuda.empty_cache()
gc.collect()
# model = get_kandinsky2('cuda', task_type='text2img', model_version='2.1', use_flash_attention=False)
# model = get_kandinsky2('cuda', task_type='inpainting', model_version='2.2')



try:
    modelStorage.model = None
except Exception as e:
    print(f'caught {type(e)}: e')

class ModelStorage:
    model = None
    task_type = ''

modelStorage = ModelStorage()
modelStorage.model = None


def getModel(task_type):
    if modelStorage.task_type != task_type:
        modelStorage.model = None
        modelStorage.task_type = task_type
        torch_gc()
        gc.collect()
        torch.cuda.empty_cache()
        print(f'Init model {task_type}...')
        time.sleep(3)
        modelStorage.model = get_kandinsky2('cuda', task_type=task_type, model_version='2.2')

    return modelStorage.model

# path to the folder where the images will be saved
folder_path = 'C:/Kandinsky-2/imgs'

print("Init API ...")
@app.route('/ping')
def ping():
    return 'pong'

@app.route('/img/<file_name>')
def get_image(file_name):
    file_path = os.path.join(folder_path, file_name)
    return send_file(file_path)

class Quote(Resource):
    def get(self, id=0):
        gc.collect()
        torch.cuda.empty_cache()
        args = request.args
        result = []
        originalH = int(args.get('h', 704))
        originalW = int(args.get('w', 704))
        squareSize = min(originalW, originalH)
        prompt = args.get('prompt', 'random beautiful thing, 4k')
        decoder_steps = int(args.get('decoder_steps', 50))
        decoder_guidance_scale = float(args.get('guidance_scale', 7))
        prior_steps = int(args.get('prior_steps', 50))
        prior_guidance_scale = float(args.get('prior_cf_scale', 0.5))
        negative_prior_prompt = args.get('negative_prior_prompt', "low quality, bad quality")
        negative_decoder_prompt = args.get('negative_decoder_prompt', "low quality, bad quality")

        for i in range(int(args.get('images_count', 1))):
            squareMask = np.ones((squareSize, squareSize), dtype=np.float32)
            squareEmptyImage = np.zeros([squareSize,squareSize,3],dtype=np.uint8)

            with torch.no_grad():
                images = getModel("inpainting").generate_inpainting(
                    prompt,
                    squareEmptyImage,
                    squareMask,
                    decoder_steps = decoder_steps,
                    batch_size = 1,
                    decoder_guidance_scale = decoder_guidance_scale,
                    h = squareSize,
                    w = squareSize,
                    prior_steps = prior_steps,
                    prior_guidance_scale = prior_guidance_scale,
                    negative_prior_prompt = negative_prior_prompt,
                    negative_decoder_prompt = negative_decoder_prompt
                )

            if originalH != originalW:
                padding = int(abs(originalW - originalH) / 2)
                originalMask = np.ones((originalH, originalW), dtype=np.float32)

                print("padding")
                print(padding)

                if originalH > originalW:
                    originalMask[padding:(padding + squareSize), :] = 0
                    newImage = add_margin(images[0], padding, 0, padding, 0, (255, 255, 255))
                else:
                    originalMask[:, padding:(padding + squareSize)] = 0
                    newImage = add_margin(images[0], 0, padding, 0, padding, (255, 255, 255))

                with torch.no_grad():
                    images2 = getModel("inpainting").generate_inpainting(
                        prompt,
                        newImage,
                        originalMask,
                        decoder_steps = decoder_steps,
                        batch_size = 1,
                        decoder_guidance_scale = decoder_guidance_scale,
                        h = originalH,
                        w = originalW,
                        prior_steps = prior_steps,
                        prior_guidance_scale = prior_guidance_scale,
                        negative_prior_prompt = negative_prior_prompt,
                        negative_decoder_prompt = negative_decoder_prompt
                    )
                guid = uuid.uuid4()
                file_name = f"{guid}_{i}.png"
                file_path = os.path.join(folder_path, file_name)
                images2[0].save(file_path)
                result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })
                torch_gc()

            else:
                guid = uuid.uuid4()
                file_name = f"{guid}_{i}.png"
                file_path = os.path.join(folder_path, file_name)
                images[0].save(file_path)
                result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })
                torch_gc()

        return result

api.add_resource(Quote, "/text2img", methods=['GET'])



class MixImages(Resource):
    def get(self, id=0):
        gc.collect()
        torch.cuda.empty_cache()
        args = request.args
        result = []
        originalH = int(args.get('h', 704))
        originalW = int(args.get('w', 704))
        squareSize = min(originalW, originalH)
        decoder_steps = int(args.get('decoder_steps', 50))
        decoder_guidance_scale = float(args.get('guidance_scale', 7))
        prior_steps = int(args.get('prior_steps', 50))
        prior_guidance_scale = float(args.get('prior_cf_scale', 0.5))
        negative_prior_prompt = args.get('negative_prior_prompt', "low quality, bad quality")
        negative_decoder_prompt = args.get('negative_decoder_prompt', "low quality, bad quality")

        images_texts = [Image.open(os.path.join(folder_path, 'b661cb45-726f-48ce-b7fd-0cc8ef388724_0.png')),Image.open(os.path.join(folder_path, '03a5c50c-b9ef-42e5-a1c3-e1a988369c91_0.png'))]

        weights = [0.5, 0.5]

        with torch.no_grad():
            images = getModel("text2img").mix_images(
                images_texts,
                weights,
                batch_size = 1,
                decoder_steps = decoder_steps,
                prior_steps = prior_steps,
                decoder_guidance_scale = decoder_guidance_scale,
                prior_guidance_scale = prior_guidance_scale,
                h=originalH,
                w=originalW,
                negative_prior_prompt = negative_prior_prompt,
                negative_decoder_prompt = negative_decoder_prompt,
            )

        guid = uuid.uuid4()
        file_name = f"{guid}.png"
        file_path = os.path.join(folder_path, file_name)
        images[0].save(file_path)
        result.append({ 'file_path': file_path, 'file_name': file_name, 'folder_path': folder_path })
        torch_gc()

        return result

api.add_resource(MixImages, "/mixImages", methods=['GET'])


if __name__ == '__main__':
    app.run(debug=True)

print("Server is ready!")



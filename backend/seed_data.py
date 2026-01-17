"""
Script to seed the database with sample research papers
Run this after starting the backend: python seed_data.py
"""
from database import SessionLocal, engine, Base
from models import Paper, User
from sqlalchemy.orm import Session

# Create tables
Base.metadata.create_all(bind=engine)

def seed_papers(db: Session):
    """Add sample papers to the database"""
    sample_papers = [
        {
            "title": "Attention Is All You Need",
            "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
            "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
            "venue": "NeurIPS",
            "year": 2017,
            "keywords": "transformer, attention mechanism, neural networks, NLP",
            "url": "https://arxiv.org/abs/1706.03762",
            "citation_count": 85000
        },
        {
            "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
            "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
            "abstract": "We introduce BERT, a new language representation model which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
            "venue": "NAACL",
            "year": 2019,
            "keywords": "BERT, transformer, language model, NLP, pre-training",
            "url": "https://arxiv.org/abs/1810.04805",
            "citation_count": 65000
        },
        {
            "title": "GPT-3: Language Models are Few-Shot Learners",
            "authors": "Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell",
            "abstract": "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples.",
            "venue": "NeurIPS",
            "year": 2020,
            "keywords": "GPT-3, language model, few-shot learning, NLP",
            "url": "https://arxiv.org/abs/2005.14165",
            "citation_count": 45000
        },
        {
            "title": "ImageNet Classification with Deep Convolutional Neural Networks",
            "authors": "Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton",
            "abstract": "We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes. On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% respectively.",
            "venue": "NeurIPS",
            "year": 2012,
            "keywords": "CNN, deep learning, ImageNet, computer vision",
            "url": "https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks",
            "citation_count": 120000
        },
        {
            "title": "Deep Residual Learning for Image Recognition",
            "authors": "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
            "abstract": "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.",
            "venue": "CVPR",
            "year": 2016,
            "keywords": "ResNet, deep learning, residual learning, computer vision",
            "url": "https://arxiv.org/abs/1512.03385",
            "citation_count": 150000
        },
        {
            "title": "Generative Adversarial Networks",
            "authors": "Ian J. Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, Yoshua Bengio",
            "abstract": "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.",
            "venue": "NeurIPS",
            "year": 2014,
            "keywords": "GAN, generative models, adversarial training, deep learning",
            "url": "https://arxiv.org/abs/1406.2661",
            "citation_count": 95000
        },
        {
            "title": "Long Short-Term Memory",
            "authors": "Sepp Hochreiter, Jürgen Schmidhuber",
            "abstract": "Learning to store information over extended time intervals by recurrent backpropagation takes a very long time, mostly because of insufficient, decaying error backflow. We briefly review Hochreiter's (1991) analysis of this problem, then address it by introducing a novel, efficient, gradient based method called long short-term memory (LSTM).",
            "venue": "Neural Computation",
            "year": 1997,
            "keywords": "LSTM, RNN, recurrent neural networks, sequence learning",
            "url": "https://www.bioinf.jku.at/publications/older/2604.pdf",
            "citation_count": 80000
        },
        {
            "title": "AlphaGo: Mastering the Game of Go with Deep Neural Networks and Tree Search",
            "authors": "David Silver, Aja Huang, Chris J. Maddison, Arthur Guez, Laurent Sifre, George van den Driessche, Julian Schrittwieser, Ioannis Antonoglou, Veda Panneershelvam, Marc Lanctot",
            "abstract": "The game of Go has long been viewed as the most challenging of classic games for artificial intelligence owing to its enormous search space and the difficulty of evaluating board positions and moves.",
            "venue": "Nature",
            "year": 2016,
            "keywords": "AlphaGo, reinforcement learning, deep learning, game AI",
            "url": "https://www.nature.com/articles/nature16961",
            "citation_count": 12000
        },
        {
            "title": "YOLO: You Only Look Once - Unified, Real-Time Object Detection",
            "authors": "Joseph Redmon, Santosh Divvala, Ross Girshick, Ali Farhadi",
            "abstract": "We present YOLO, a new approach to object detection. Prior work on object detection repurposes classifiers to perform detection. Instead, we frame object detection as a regression problem to spatially separated bounding boxes and associated class probabilities.",
            "venue": "CVPR",
            "year": 2016,
            "keywords": "YOLO, object detection, computer vision, real-time",
            "url": "https://arxiv.org/abs/1506.02640",
            "citation_count": 35000
        },
        {
            "title": "The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks",
            "authors": "Jonathan Frankle, Michael Carbin",
            "abstract": "Neural network pruning techniques can reduce the parameter counts of trained networks by over 90%, decreasing storage requirements and improving computational performance of inference without compromising accuracy. However, contemporary experience is that the sparse architectures produced by pruning are difficult to train from the start.",
            "venue": "ICLR",
            "year": 2019,
            "keywords": "neural network pruning, lottery ticket hypothesis, deep learning",
            "url": "https://arxiv.org/abs/1803.03635",
            "citation_count": 2500
        }
    ]
    
    for paper_data in sample_papers:
        # Check if paper already exists
        existing = db.query(Paper).filter(Paper.title == paper_data["title"]).first()
        if not existing:
            paper = Paper(**paper_data)
            db.add(paper)
    
    db.commit()
    print(f"Seeded {len(sample_papers)} papers")

def seed_users(db: Session):
    """Add a default user"""
    user = db.query(User).filter(User.username == "researcher").first()
    if not user:
        user = User(
            username="researcher",
            email="researcher@example.com",
            name="Research Enthusiast",
            research_interests="machine learning, deep learning, NLP, computer vision"
        )
        db.add(user)
        db.commit()
        print("Created default user: researcher")
    else:
        print("Default user already exists")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_papers(db)
        seed_users(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()
